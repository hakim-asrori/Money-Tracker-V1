<?php

namespace App\Http\Controllers;

use App\Enums\CategoryTypeConstant;
use App\Models\Category;
use App\Models\Income;
use App\Models\Mutation;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IncomeController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Income $income)
    {
        $this->user = Auth::user();
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
        $incomes = $incomeQuery->with(['category', 'wallet'])->paginate();

        return Inertia::render('income', [
            'categories' => $categories,
            'wallets' => $wallets,
            'incomes' => $incomes
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

            $income->wallet()->update([
                'balance' => $wallet->balance + $request->amount,
            ]);

            $income->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $request->wallet,
                'type' => Mutation::TYPE_CR,
                'last_balance' => $wallet->balance,
                'amount' => $request->amount,
                'current_balance' => $wallet->balance + $request->amount,
                'description' => "Income: add {$request->amount} to {$wallet->name}",
            ]);

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
        //
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
            $income->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $income->wallet_id,
                'type' => Mutation::TYPE_DB,
                'last_balance' => $income->wallet->balance,
                'amount' => $income->amount,
                'current_balance' => $income->wallet->balance - $income->amount,
                'description' => "Income: remove {$income->amount} from {$income->wallet->name}",
            ]);

            $income->wallet()->update([
                'balance' => $income->wallet->balance - $income->amount,
            ]);

            $income->delete();

            DB::commit();
            return redirect()->route('income.index')->with('success', 'Income successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('income.index')->with('error', $th->getMessage());
        }
    }
}
