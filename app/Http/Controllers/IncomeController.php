<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Validator};
use Illuminate\Validation\Rule;
use App\Enums\CategoryTypeConstant;
use App\Models\{Category, Income, Mutation, Wallet};
use App\Services\WalletService;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class IncomeController extends Controller
{
    protected $user, $agent;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Income $income)
    {
        $this->user = Auth::user();
        $this->agent = new Agent();
    }

    public function index(Request $request)
    {
        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::INCOME->value)
            ->get();
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        $incomeQuery = $this->income->query();
        $incomeQuery->where('user_id', $this->user->id);
        $incomeQuery->when($request->has('category') && $request->get('category') != '-1' && $request->filled('category'), function ($query) use ($request) {
            $query->where('category_id', $request->get('category'));
        });
        $incomeQuery->when($request->has('wallet') && $request->get('wallet') != '-1' && $request->filled('wallet'), function ($query) use ($request) {
            $query->where('wallet_id', $request->get('wallet'));
        });
        $incomeQuery->when($request->has('search') && $request->filled('search'), function ($query) use ($request) {
            $query->where('title', 'like', "%{$request->search}%");
        });
        $incomeQuery->orderByDesc('published_at');
        $incomes = $incomeQuery->with(['category', 'wallet'])->paginate($request->get('perPage', 10));

        if ($this->agent->isMobile()) {
            return Inertia::render('mobile/income/index', [
                'incomes' => $incomes,
                'wallets' => $wallets,
                'filters' => $request->all('search', 'perPage', 'page', 'category', 'wallet'),
            ]);
        }

        return Inertia::render('income', [
            'categories' => $categories,
            'wallets' => $wallets,
            'incomes' => $incomes,
            'filters' => $request->all('search', 'perPage', 'page', 'category', 'wallet'),
        ]);
    }


    public function create(Request $request)
    {
        if (!$this->agent->isMobile()) {
            return redirect()->route('income.index');
        }

        if (!$request->has('wallet')) {
            return to_route('income.index')->with('warning', 'Please select wallet');
        }

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);
        if (!$wallet) {
            return to_route('income.index')->with('warning', 'Wallet not found');
        }

        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::INCOME->value)
            ->get();

        return Inertia::render('mobile/income/create', [
            'categories' => $categories,
            'wallet' => $wallet,
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'wallet' => ['required', 'integer', Rule::exists('wallets', 'id')->where('user_id', $this->user->id)->whereNull('deleted_at')],
            'title' => 'required|string|min:3|max:200',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:200',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

        DB::beginTransaction();

        try {
            $income = $this->income->create([
                'user_id' => $this->user->id,
                'category_id' => $request->category,
                'wallet_id' => $request->wallet,
                'title' => $request->title,
                'amount' => $request->amount,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            WalletService::createWalletMutation($income, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_CR);

            DB::commit();
            return redirect()->route('income.index')->with('success', 'Income successfully added');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('income.index')->with('error', $th->getMessage());
        }
    }


    public function show(string $id)
    {
        //
    }


    public function edit(string $id)
    {
        if (!$this->agent->isMobile()) {
            return redirect()->route('income.index');
        }

        $income = $this->income->where('user_id', $this->user->id)->find($id);
        if (!$income) {
            return to_route('income.index')->with('warning', 'Income not found');
        }

        $income->load(['category']);

        $categories = $this->category
            ->where('user_id', $this->user->id)
            ->where('type', CategoryTypeConstant::INCOME->value)
            ->get();

        return Inertia::render('mobile/income/edit', [
            'income' => $income,
            'categories' => $categories,
        ]);
    }


    public function update(Request $request, Income $income)
    {
        $request->validate([
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)],
            'title' => 'required|string|min:3|max:200',
            'description' => 'required|string|min:3|max:200',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        DB::beginTransaction();

        try {
            $income->update([
                'category_id' => $request->category,
                'title' => $request->title,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            DB::commit();
            return redirect()->route('income.index')->with('success', 'Income successfully updated');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('income.index')->with('error', $th->getMessage());
        }
    }


    public function destroy(Income $income)
    {
        DB::beginTransaction();

        try {
            WalletService::createWalletMutation($income, $this->user->id, $income->wallet_id, $income->amount, Mutation::TYPE_DB);

            $income->delete();

            DB::commit();
            return redirect()->route('income.index')->with('success', 'Income successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('income.index')->with('error', $th->getMessage());
        }
    }
}
