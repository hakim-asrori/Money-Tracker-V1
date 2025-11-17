<?php

namespace App\Http\Controllers\API\Debt;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\DebtTarget;
use App\Models\Mutation;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ReceivableController extends Controller
{
    protected $user;

    public function __construct(protected Debt $debt, protected Wallet $wallet)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $debtQuery = $this->debt->query();
        $debtQuery->where('user_id', $this->user->id);
        $debtQuery->where('type', $this->debt::TYPE_CREDIT);
        $debtQuery->with(['wallet', 'target.debtPayments.walletTarget', 'transaction']);
        $debtQuery->withSum('targets as total_remaining_amount', 'remaining_amount');
        $debtQuery->withSum('targets as total_paid_amount', 'paid_amount');

        if ($request->boolean('paginate')) {
            $debts = $debtQuery->paginate();
            return MessageFixer::paginate('Debt Receivables', $debts);
        }

        $debts = $debtQuery->get();
        return MessageFixer::success('Debt Receivables', $debts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'wallet' => [
                'required',
                'integer',
                Rule::exists('wallets', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)
            ],
            'title' => 'required|string|min:3|max:100',
            'target' => 'required|string|min:3|max:100',
            'amount' => 'required|numeric|min:0',
            'fee' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'due_date' => 'nullable|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

        DB::beginTransaction();

        $amount = $request->amount + $request->fee;

        try {
            $debt = $this->debt->create([
                'wallet_id' => $request->wallet,
                'user_id' => $this->user->id,
                'type' => $this->debt::TYPE_CREDIT,
                'title' => $request->title,
                'amount' => $request->amount,
                'fee' => $request->fee,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            $debt->target()->create([
                'name' => $request->target,
                'amount' => $amount,
                'remaining_amount' => $amount,
                'due_date' => $request->due_date,
            ]);

            WalletService::createWalletMutation($debt, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_DB);
            if ($request->fee > 0) {
                WalletService::createWalletMutation($debt, $this->user->id, $wallet->id, $request->fee, Mutation::TYPE_DB);
            }

            DB::commit();
            return MessageFixer::success('Debt receivable created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();

            if ($th->getCode() === MessageFixer::HTTP_BAD_REQUEST) {
                return MessageFixer::warning($th->getMessage());
            }

            return MessageFixer::error($th->getMessage());
        }
    }


    public function show(string $id)
    {
        $receivable = $this->debt->where('user_id', $this->user->id)->find($id);
        if (!$receivable) {
            return MessageFixer::notFound('Debt receivable not found');
        }

        $receivable->load(['target.debtPayments.walletTarget', 'transaction']);
        $receivable->loadSum('targets as total_remaining_amount', 'remaining_amount');
        $receivable->loadSum('targets as total_paid_amount', 'paid_amount');

        return MessageFixer::success('Debt receivable', $receivable);
    }


    public function update(Request $request, $id)
    {
        $receivable = $this->debt->where('user_id', $this->user->id)->find($id);
        if (!$receivable) {
            return MessageFixer::notFound('Debt receivable not found');
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:3|max:100',
            'target' => 'required|string|min:3|max:100',
            'description' => 'required|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'due_date' => 'nullable|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        DB::beginTransaction();

        try {
            $receivable->update([
                'title' => $request->title,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            $receivable->target()->update([
                'name' => $request->target,
                'due_date' => $request->due_date,
            ]);

            DB::commit();
            return MessageFixer::success('Debt receivable updated successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function payment(Request $request, $id)
    {
        $receivable = $this->debt->where('user_id', $this->user->id)->find($id);
        if (!$receivable) {
            return MessageFixer::notFound('Debt receivable not found');
        }

        $validator = Validator::make($request->all(), [
            'wallet' => [
                'required',
                'integer',
                Rule::exists('wallets', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)
            ],
            'amount' => 'required|numeric|min:0',
            'note' => 'string|min:3|max:255',
            'paid_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        DB::beginTransaction();

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($receivable->wallet_id);

        if ($request->amount > $receivable->target->remaining_amount) {
            return MessageFixer::warning('Amount is greater than remaining amount');
        }

        try {
            $receivable->target()->increment('paid_amount', $request->amount);
            $receivable->target()->decrement('remaining_amount', $request->amount);
            if ($receivable->target->remaining_amount == 0) {
                $receivable->target()->update([
                    'status' => DebtTarget::STATUS_PAID
                ]);
            }

            $receivable->target->debtPayments()->create([
                'user_id' => $this->user->id,
                'wallet_target_id' => $wallet->id,
                'amount' => $request->amount,
                'note' => $request->note,
                'paid_at' => $request->paid_at,
            ]);

            WalletService::createWalletMutation($receivable, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_CR);

            DB::commit();
            return MessageFixer::success('Debt payment created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }


    public function destroy($id)
    {
        DB::beginTransaction();

        $receivable = $this->debt->where('user_id', $this->user->id)->find($id);
        if (!$receivable) {
            return MessageFixer::notFound('Debt receivable not found');
        }

        try {
            if ($receivable->target->debtPayments->count() > 0) {
                foreach ($receivable->target->debtPayments as $debtPayment) {
                    WalletService::createWalletMutation($debtPayment, $this->user->id, $debtPayment->wallet_target_id, $debtPayment->amount, Mutation::TYPE_DB);
                }

                $receivable->target->debtPayments()->delete();
            }

            $receivable->target()->delete();

            $amount = $receivable->amount + $receivable->fee;
            WalletService::createWalletMutation($receivable, $this->user->id, $receivable->wallet_id, $amount, Mutation::TYPE_CR);

            $receivable->delete();

            DB::commit();
            return MessageFixer::success('Debt receivable deleted successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }
}
