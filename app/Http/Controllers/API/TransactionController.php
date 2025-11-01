<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Debt;
use App\Models\DebtTarget;
use App\Models\Mutation;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Transaction $transaction, protected DebtTarget $debtTarget)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $transactionQuery = $this->transaction
            ->where('user_id', $this->user->id)
            ->with(['category', 'wallet'])
            ->orderByDesc('created_at'); // optional, biar urut terbaru dulu

        if ($request->boolean('paginate')) {
            $transactions = $transactionQuery->paginate($request->integer('perPage', 10));
            return MessageFixer::paginate('Transactions', $transactions);
        }

        $transactions = $transactionQuery->get();
        return MessageFixer::success('Transactions', $transactions);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'wallet' => ['required', 'integer', Rule::exists('wallets', 'id')->where('user_id', $this->user->id)->whereNull('deleted_at')],
            'title' => 'required|string|min:3|max:200',
            'amount' => 'required|numeric|min:0',
            'fee' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:200',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'is_debt' => 'nullable|boolean',
            'targets' => 'required_if:is_debt,true|array',
            'targets.*.user_id' => 'nullable|integer|exists:users,id',
            'targets.*.name' => 'required_without:targets.*.user_id|string|min:3|max:100',
            'targets.*.amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validation($validator->errors()->first(), $validator->errors(), true);
        }

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

        DB::beginTransaction();

        try {
            $transaction = $this->transaction->create([
                'user_id' => $this->user->id,
                'category_id' => $request->category,
                'wallet_id' => $request->wallet,
                'title' => $request->title,
                'amount' => $request->amount,
                'fee' => $request->fee,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            if ($request->boolean('is_debt')) {
                $debt = $transaction->debt()->create([
                    'user_id' => $this->user->id,
                    'wallet_id' => $wallet->id,
                    'type' => Debt::TYPE_CREDIT,
                    'title' => $request->title,
                    'amount' => $request->amount + $request->fee,
                    'description' => $request->description,
                    'published_at' => $request->published_at,
                ]);

                foreach ($request->targets as $target) {
                    $debt->targets()->create([
                        'user_id' => $target['user_id'] ?? null,
                        'name' => $target['name'] ?? null,
                        'amount' => (float) $target['amount'],
                        'remaining_amount' => (float) $target['amount'],
                    ]);
                }
            }

            WalletService::createWalletMutation($transaction, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_DB);
            if ($request->fee > 0) {
                WalletService::createWalletMutation($transaction, $this->user->id, $wallet->id, $request->fee, Mutation::TYPE_DB);
            }

            DB::commit();
            return MessageFixer::success('Transaction successfully created', $transaction);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function debtPayment(Request $request, $id)
    {
        $target = $this->debtTarget->where('user_id', $this->user->id)->find($id);
        if (!$target) {
            return MessageFixer::notFound('Target not found');
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0|max:' . $target->remaining_amount,
            'wallet' => ['required', 'integer', Rule::exists('wallets', 'id')->where('user_id', $this->user->id)->whereNull('deleted_at')],
            'note' => 'required|string|min:3|max:200',
            'paid_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validation($validator->errors()->first(), $validator->errors(), true);
        }

        DB::beginTransaction();

        try {
            $target->increment('paid_amount', $request->amount);
            $target->decrement('remaining_amount', $request->amount);

            if ($target->remaining_amount == 0) {
                $target->update([
                    'status' => DebtTarget::STATUS_PAID
                ]);

                $target->debt()->update([
                    'status' => Debt::STATUS_PAID
                ]);
            }

            $target->debtPayments()->create([
                'user_id' => $this->user->id,
                'wallet_target_id' => $request->wallet,
                'amount' => $request->amount,
                'note' => $request->note,
                'paid_at' => $request->paid_at,
            ]);

            WalletService::createWalletMutation($target, $this->user->id, $request->wallet, $request->amount, Mutation::TYPE_CR);

            DB::commit();
            return MessageFixer::success('Payment successfully created');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function show($id)
    {
        $transaction = $this->transaction->with(['category', 'wallet', 'debt.targets.debtPayments.walletTarget'])->find($id);
        if (!$transaction) {
            return MessageFixer::notFound('Transaction not found');
        }

        return MessageFixer::success('Transaction', $transaction);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)],
            'title' => 'required|string|min:3|max:200',
            'description' => 'nullable|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validation($validator->errors()->first(), $validator->errors(), true);
        }

        $transaction = $this->transaction->find($id);
        if (!$transaction) {
            return MessageFixer::notFound('Transaction not found');
        }

        DB::beginTransaction();

        try {
            $transaction->update([
                'category_id' => $request->category,
                'title' => $request->title,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            DB::commit();
            return MessageFixer::success('Transaction successfully updated', $transaction);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function destroy($id)
    {
        return MessageFixer::error('Service not available');

        $transaction = $this->transaction->find($id);
        if (!$transaction) {
            return MessageFixer::notFound('Transaction not found');
        }

        DB::beginTransaction();

        try {
            $amount = $transaction->amount + $transaction->fee;
            $transaction->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $transaction->wallet_id,
                'type' => Mutation::TYPE_CR,
                'last_balance' => $transaction->wallet->balance,
                'amount' => $amount,
                'current_balance' => $transaction->wallet->balance + $amount,
                'description' => "Transaction: add {$amount} from {$transaction->title}",
            ]);

            $transaction->wallet()->update([
                'balance' => $transaction->wallet->balance + $amount,
            ]);

            $transaction->delete();

            DB::commit();
            return MessageFixer::success('Transaction successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }
}
