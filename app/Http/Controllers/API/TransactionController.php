<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Mutation;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Transaction $transaction)
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

            $amount = $request->amount + $request->fee;
            $transaction->wallet()->update([
                'balance' => $wallet->balance + $amount,
            ]);

            $transaction->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $request->wallet,
                'type' => Mutation::TYPE_DB,
                'last_balance' => $wallet->balance,
                'amount' => $amount,
                'current_balance' => $wallet->balance + $amount,
                'description' => "Transaction: add {$amount} from {$transaction->title}",
            ]);

            DB::commit();
            return MessageFixer::success('Transaction successfully created', $transaction);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function show($id)
    {
        $transaction = $this->transaction->with(['category', 'wallet'])->find($id);
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
