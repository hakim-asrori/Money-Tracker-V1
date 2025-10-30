<?php

namespace App\Http\Controllers;

use App\Enums\CategoryTypeConstant;
use App\Models\Category;
use App\Models\Mutation;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TransactionController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Transaction $transaction)
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
        $transactions = $transactionQuery->with(['category', 'wallet'])->paginate();

        return Inertia::render('transaction', [
            'categories' => $categories,
            'wallets' => $wallets,
            'transactions' => $transactions
        ]);
    }


    public function create()
    {
        //
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

            $amount = $request->amount + $request->fee;
            $transaction->wallet()->update([
                'balance' => $wallet->balance - $amount,
            ]);

            $transaction->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $request->wallet,
                'type' => Mutation::TYPE_DB,
                'last_balance' => $wallet->balance,
                'amount' => $amount,
                'current_balance' => $wallet->balance - $amount,
                'description' => "Transaction: remove {$amount} to {$wallet->name}",
            ]);

            DB::commit();
            return redirect()->route('transaction.index')->with('success', 'Transaction successfully created');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('transaction.index')->with('error', $th->getMessage());
        }
    }


    public function show(string $id)
    {
        //
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
            return redirect()->back()->with('success', 'Transaction successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
