<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Mutation;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class WalletController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $walletQuery = $this->wallet
            ->where('user_id', $this->user->id)
            ->with('category')
            ->when(
                $request->filled('category') && $request->get('category') != '-1',
                fn($q) => $q->where('category_id', $request->get('category'))
            )
            ->when(
                $request->filled('search'),
                fn($q) => $q->where('name', 'like', "%{$request->search}%")
            )
            ->orderByDesc('created_at');

        if ($request->boolean('paginate')) {
            $wallets = $walletQuery->paginate($request->integer('perPage', 10));
            return MessageFixer::paginate('Wallets', $wallets);
        }

        $wallets = $walletQuery->get();
        return MessageFixer::success('Wallets', $wallets);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->whereNull('deleted_at')
                    ->where('user_id', $this->user->id)
            ],
            'name' => 'required|string|min:3|max:100',
            'balance' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        DB::beginTransaction();

        try {
            $wallet = $this->wallet->create([
                'category_id' => $request->category,
                'name' => $request->name,
                'balance' => $request->balance,
                'user_id' => $this->user->id
            ]);

            if ($request->balance > 0) {
                $wallet->mutation()->create([
                    'wallet_id' => $wallet->id,
                    'user_id' => $wallet->user_id,
                    'type' => Mutation::TYPE_CR,
                    'amount' => $request->balance,
                    'current_balance' => $request->balance,
                    'description' => "Initial balance of {$request->name}",
                ]);
            }

            DB::commit();
            return MessageFixer::success('Wallet created successfully', $wallet);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error('Error', $th->getMessage());
        }
    }

    public function show($id)
    {
        $wallet = $this->wallet->where('user_id', $this->user->id)->with('category')->find($id);
        if (!$wallet) {
            return MessageFixer::error('Wallet not found');
        }

        return MessageFixer::success('Wallet', $wallet);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'category' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->whereNull('deleted_at')
                    ->where('user_id', $this->user->id)
            ],
            'name' => 'required|string|min:3|max:100',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($id);
        if (!$wallet) {
            return MessageFixer::error('Wallet not found');
        }

        DB::beginTransaction();

        try {
            $wallet->update([
                'category_id' => $request->category,
                'name' => $request->name,
            ]);

            DB::commit();
            return MessageFixer::success('Wallet updated successfully', $wallet);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error('Error', $th->getMessage());
        }
    }

    public function destroy($id)
    {
        $wallet = $this->wallet->where('user_id', $this->user->id)->find($id);
        if (!$wallet) {
            return MessageFixer::error('Wallet not found');
        }

        if ($wallet->balance > 0) {
            return MessageFixer::error('Wallet has balance, cannot delete');
        }

        try {
            $wallet->delete();
            return MessageFixer::success('Wallet deleted successfully');
        } catch (\Throwable $th) {
            return MessageFixer::error('Error', $th->getMessage());
        }
    }
}
