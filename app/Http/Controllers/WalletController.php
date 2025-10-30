<?php

namespace App\Http\Controllers;

use App\Enums\CategoryTypeConstant;
use App\Models\Category;
use App\Models\Mutation;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WalletController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::WALLET->value)
            ->get();

        $walletQuery = $this->wallet->query();
        $walletQuery->when($request->has('category') && $request->get('category') != '-1' && $request->filled('category'), function ($query) use ($request) {
            $query->where('category_id', $request->get('category'));
        });
        $walletQuery->when($request->has('search') && $request->filled('search'), function ($query) use ($request) {
            $query->where('name', 'like', "%{$request->search}%");
        });
        $walletQuery->where('user_id', $this->user->id);
        $walletQuery->with('category');
        $wallets = $walletQuery->paginate();

        return Inertia::render('wallet', [
            'wallets' => $wallets,
            'categories' => $categories,
            'filters' => $request->only('search', 'type'),
        ]);
    }


    public function create()
    {
        //
    }


    public function store(Request $request)
    {
        $request->validate([
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
            return redirect()->back()->with('success', 'Wallet created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
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


    public function update(Request $request, Wallet $wallet)
    {
        $request->validate([
            'category' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->whereNull('deleted_at')
                    ->where('user_id', $this->user->id)
            ],
            'name' => 'required|string|min:3|max:100',
        ]);

        DB::beginTransaction();

        try {
            $wallet->update([
                'category_id' => $request->category,
                'name' => $request->name,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Wallet updated successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function destroy(Wallet $wallet)
    {
        DB::beginTransaction();

        if ($wallet->balance > 0) {
            DB::rollBack();
            return redirect()->back()->with('warning', 'Wallet has balance, cannot delete');
        }

        try {
            $wallet->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Wallet deleted successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
