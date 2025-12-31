<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\Rule;
use App\Enums\CategoryTypeConstant;
use App\Models\{Category, Mutation, Wallet};
use App\Services\WalletService;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class WalletController extends Controller
{
    protected $user, $agent;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Mutation $mutation)
    {
        $this->user = Auth::user();
        $this->agent = new Agent();
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
        $walletQuery->orderBy('balance', 'desc');
        $walletQuery->with('category');
        $wallets = $walletQuery->paginate($request->get('perPage', 10));

        if ($this->agent->isMobile()) {
            return Inertia::render('mobile/wallet/index', [
                'wallets' => $wallets,
                'filters' => $request->only('search', 'type', 'page', 'perPage'),
            ]);
        }

        return Inertia::render('wallet', [
            'wallets' => $wallets,
            'categories' => $categories,
            'filters' => $request->only('search', 'type', 'page', 'perPage'),
        ]);
    }


    public function create()
    {
        if (!$this->agent->isMobile()) {
            return to_route('wallet.index');
        }

        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::WALLET->value)
            ->get();

        return Inertia::render('mobile/wallet/create', [
            'categories' => $categories
        ]);
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
                    ->where('type', CategoryTypeConstant::WALLET->value)
            ],
            'name' => 'required|string|min:3|max:100',
            'balance' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $wallet = $this->wallet->create([
                'category_id' => $request->category,
                'name' => $request->name,
                'user_id' => $this->user->id
            ]);

            if ($request->balance > 0) {
                WalletService::createWalletMutation($wallet, $this->user->id, $wallet->id, $request->balance, Mutation::TYPE_CR);
            }

            DB::commit();
            return to_route('wallet.index')->with('success', 'Wallet created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function show(string $id, Request $request)
    {
        if (!$this->agent->isMobile()) {
            return to_route('wallet.index');
        }

        $wallet = $this->wallet->with(['category', 'mutations'])->find($id);
        if (!$wallet) {
            return to_route('wallet.index')->with('warning', 'Wallet not found');
        }

        $mutations = $this->mutation->where('wallet_id', $wallet->id)->paginate($request->get('perPage', 10));
        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::WALLET->value)
            ->get();

        return Inertia::render('mobile/wallet/detail', [
            'wallet' => $wallet,
            'mutations' => $mutations,
            'categories' => $categories
        ]);
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
                    ->where('type', CategoryTypeConstant::WALLET->value)
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
