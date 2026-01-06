<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Validator};
use Illuminate\Validation\Rule;
use App\Enums\CategoryTypeConstant;
use App\Models\{Category, Debt, DebtTarget, Mutation, Transaction, Wallet};
use App\Services\WalletService;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class TransactionController extends Controller
{
    protected $user, $agent;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Transaction $transaction, protected DebtTarget $debtTarget)
    {
        $this->user = Auth::user();
        $this->agent = new Agent();
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
        $transactionQuery->orderByDesc('published_at');
        $transactions = $transactionQuery->with(['category', 'wallet', 'debt.targets'])->paginate($request->get('perPage', 10));

        $transaction = null;
        if ($request->has('edit') && $request->filled('edit')) {
            $transaction = $this->transaction->with(['category', 'wallet', 'debt'])->find($request->get('edit'));
        }

        if ($this->agent->isMobile()) {
            return Inertia::render('mobile/transaction/index', [
                'wallets' => $wallets,
                'transactions' => $transactions,
                'filters' => $request->all('search', 'perPage', 'page', 'category', 'wallet')
            ]);
        }

        return Inertia::render('transaction/index', [
            'categories' => $categories,
            'wallets' => $wallets,
            'transactions' => $transactions,
            'transaction' => $transaction,
            'filters' => $request->all('search', 'perPage', 'page', 'category', 'wallet')
        ]);
    }


    public function create(Request $request)
    {
        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::TRANSACTION->value)
            ->get();
        $users = $this->user->where('id', '!=', $this->user->id)->get();

        if ($this->agent->isMobile()) {
            $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

            return Inertia::render('mobile/transaction/create', [
                'categories' => $categories,
                'users' => $users,
                'wallet' => $wallet
            ]);
        }

        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

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
            'amount' => 'required|numeric|min:1',
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
        if ($wallet->balance < 1) {
            return redirect()->back()->with('error', 'Wallet balance is not enough');
        }

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
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function show(Transaction $transaction)
    {
        if ($this->agent->isMobile()) {
            return Inertia::render('mobile/transaction/detail', [
                'transaction' => $transaction->load(['category', 'wallet', 'debt.targets.debtPayments.walletTarget']),
            ]);
        }

        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        return Inertia::render('transaction/show', [
            'transaction' => $transaction->load(['category', 'wallet', 'debt.targets.debtPayments.walletTarget']),
            'wallets' => $wallets
        ]);
    }

    public function debtPayment(Request $request, $id)
    {
        $target = $this->debtTarget->find($id);
        if (!$target) {
            return redirect()->back()->with('error', 'Target not found');
        }

        $request->validate([
            'amount' => 'required|numeric|min:1|max:' . $target->remaining_amount,
            'wallet' => ['required', 'integer', Rule::exists('wallets', 'id')->where('user_id', $this->user->id)->whereNull('deleted_at')],
            'note' => 'required|string|min:1|max:200',
            'paid_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        DB::beginTransaction();

        if ($request->amount > $target->remaining_amount) {
            return redirect()->back()->with('error', 'Amount is greater than remaining amount');
        }

        try {
            $target->increment('paid_amount', $request->amount);
            $target->decrement('remaining_amount', $request->amount);

            if ($target->remaining_amount == 0) {
                $target->update([
                    'status' => DebtTarget::STATUS_PAID
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
        if (!$this->agent->isMobile()) {
            return redirect()->route('transaction.index');
        }

        $transaction = $this->transaction->where('user_id', $this->user->id)->find($id);
        if (!$transaction) {
            return redirect()->route('transaction.index');
        }

        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::TRANSACTION->value)
            ->get();

        return Inertia::render('mobile/transaction/edit', [
            'transaction' => $transaction->load(['category', 'wallet', 'debt.targets.debtPayments.walletTarget']),
            'categories' => $categories
        ]);
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
            return redirect()->route('transaction.index')->with('success', 'Transaction successfully updated');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function destroy(Transaction $transaction)
    {
        DB::beginTransaction();

        $transaction->load(['wallet', 'debt.targets.debtPayments.walletTarget']);

        try {
            if ($transaction->debt) {
                foreach ($transaction->debt->targets as $debtTarget) {
                    if ($debtTarget->debtPayments->count() > 0) {
                        foreach ($debtTarget->debtPayments as $debtPayment) {
                            WalletService::createWalletMutation($debtPayment, $this->user->id, $debtPayment->wallet_target_id, $debtPayment->amount, Mutation::TYPE_DB);
                        }

                        $debtTarget->debtPayments()->delete();
                    }

                    $debtTarget->delete();
                }

                $transaction->debt()->delete();
            }

            $amount = $transaction->amount + $transaction->fee;
            WalletService::createWalletMutation($transaction, $this->user->id, $transaction->wallet_id, $amount, Mutation::TYPE_CR);

            $transaction->delete();

            DB::commit();
            return redirect()->route('transaction.index')->with('success', 'Transaction successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
