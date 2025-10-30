<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Income;
use App\Models\Mutation;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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
            'amount' => 'required|numeric|min:0',
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
            return MessageFixer::success('Income successfully deleted');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }
}
