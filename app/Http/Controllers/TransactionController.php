<?php

namespace App\Http\Controllers;

use App\Enums\CategoryTypeConstant;
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
use Inertia\Inertia;

class TransactionController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Transaction $transaction, protected DebtTarget $debtTarget)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::TRANSACTION->value)
            ->get();
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        $transactionQuery = $this->transaction->query();
        $transactionQuery->where('user_id', $this->user->id);
        $transactions = $transactionQuery->with(['category', 'wallet', 'debt'])->paginate();

        $transaction = null;
        if ($request->has('edit') && $request->filled('edit')) {
            $transaction = $this->transaction->with(['category', 'wallet', 'debt'])->find($request->get('edit'));
        }

        return Inertia::render('transaction/index', [
            'categories' => $categories,
            'wallets' => $wallets,
            'transactions' => $transactions,
            'transaction' => $transaction
        ]);
    }


    public function create()
    {
        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::TRANSACTION->value)
            ->get();
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();
        $users = $this->user->where('id', '!=', $this->user->id)->get();

        return Inertia::render('transaction/create', [
            'categories' => $categories,
            'wallets' => $wallets,
            'users' => $users
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
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
            return redirect()->route('transaction.index')->with('success', 'Transaction successfully created');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('transaction.index')->with('error', $th->getMessage());
        }
    }


    public function show(Transaction $transaction)
    {
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        return Inertia::render('transaction/show', [
            'transaction' => $transaction->load(['category', 'wallet', 'debt.targets.debtPayments.walletTarget']),
            'wallets' => $wallets
        ]);
    }

    public function debtPayment(Request $request, $id)
    {
        $target = $this->debtTarget->find($id);

        $request->validate([
            'amount' => 'required|numeric|min:0|max:' . $target->remaining_amount,
            'wallet' => ['required', 'integer', Rule::exists('wallets', 'id')->where('user_id', $this->user->id)->whereNull('deleted_at')],
            'note' => 'required|string|min:3|max:200',
            'paid_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

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
            return redirect()->back()->with('success', 'Debt successfully updated');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }

    public function edit(string $id)
    {
        //
    }


    public function update(Request $request, Transaction $transaction)
    {
        $request->validate([
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)],
            'title' => 'required|string|min:3|max:200',
            'description' => 'nullable|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        DB::beginTransaction();

        try {
            $transaction->update([
                'category_id' => $request->category,
                'title' => $request->title,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Transaction successfully updated');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function destroy(Transaction $transaction)
    {
        return redirect()->back()->with('error', 'Service not available');

        DB::beginTransaction();

        try {
            if ($transaction->debt) {
                foreach ($transaction->debt->targets as $debtTarget) {
                    if ($debtTarget->debtPayments->count() > 0) {
                        foreach ($debtTarget->debtPayments as $debtPayment) {
                            WalletService::createWalletMutation($debtPayment, $this->user->id, $debtPayment->wallet_target_id, $debtPayment->amount, Mutation::TYPE_DB);

                            $debtPayment->walletTarget()->decrement('balance', $debtPayment->amount);
                        }
                    }
                }

                $debtTarget->debtPayments()->delete();
                $transaction->debt()->delete();
            }

            $amount = $transaction->amount + $transaction->fee;
            WalletService::createWalletMutation($transaction, $this->user->id, $transaction->wallet_id, $amount, Mutation::TYPE_CR);
            $transaction->wallet()->increment('balance', $amount);

            $transaction->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Transaction successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
