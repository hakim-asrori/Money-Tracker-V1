<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Validator};
use Illuminate\Validation\Rule;
use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\{Category, Income, Mutation, Wallet};
use App\Services\WalletService;

class IncomeController extends Controller
{
    protected $user;

    public function __construct(protected Category $category, protected Wallet $wallet, protected Income $income)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $incomeQuery = $this->income
            ->where('user_id', $this->user->id)
            ->when(
                $request->filled('category') && $request->get('category') != '-1',
                fn($q) => $q->where('category_id', $request->get('category'))
            )
            ->when(
                $request->filled('search'),
                fn($q) => $q->where('name', 'like', "%{$request->search}%")
            )
            ->when(
                $request->filled('publishedAt'),
                fn($q) => $q->whereDate('published_at', $request->get('publishedAt'))
            )
            ->when(
                $request->filled('wallet') && $request->get('wallet') != '-1',
                fn($q) => $q->where('wallet_id', $request->get('wallet'))
            )
            ->with(['category', 'wallet']);

        if ($request->boolean('paginate')) {
            $incomes = $incomeQuery->paginate($request->integer('perPage', 10));
            return MessageFixer::paginate('Incomes', $incomes);
        }

        $incomes = $incomeQuery->get();
        return MessageFixer::success('Incomes', $incomes);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'wallet' => ['required', 'integer', Rule::exists('wallets', 'id')->where('user_id', $this->user->id)->whereNull('deleted_at')],
            'title' => 'required|string|min:3|max:200',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|min:3|max:200',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

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

            $income->wallet()->increment('balance', $request->amount);

            WalletService::createWalletMutation($income, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_CR);

            DB::commit();
            return MessageFixer::success('Income successfully created', $income);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function show($id)
    {
        $income = $this->income->with(['category', 'wallet'])->find($id);
        if (!$income) {
            return MessageFixer::notFound('Income not found');
        }

        return MessageFixer::success('Income', $income);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)],
            'title' => 'required|string|min:3|max:200',
            'description' => 'required|string|min:3|max:200',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        $income = $this->income->find($id);
        if (!$income) {
            return MessageFixer::notFound('Income not found');
        }

        DB::beginTransaction();

        try {
            $income->update([
                'category_id' => $request->category,
                'title' => $request->title,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            DB::commit();
            return MessageFixer::success('Income successfully updated', $income);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function destroy($id)
    {
        $income = $this->income->find($id);
        if (!$income) {
            return MessageFixer::notFound('Income not found');
        }

        DB::beginTransaction();

        try {
            WalletService::createWalletMutation($income, $this->user->id, $income->wallet_id, $income->amount, Mutation::TYPE_DB);

            $income->delete();

            DB::commit();
            return MessageFixer::success('Income successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }
}
