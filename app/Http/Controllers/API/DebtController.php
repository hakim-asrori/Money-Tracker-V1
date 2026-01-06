<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Validator};
use Illuminate\Validation\Rule;
use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\{Debt, Mutation, Wallet};

class DebtController extends Controller
{
    protected $user;

    public function __construct(protected Debt $debt, protected Wallet $wallet)
    {
        $this->user = Auth::user();
    }

    public function index()
    {
        //
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'wallet' => [
                'required',
                'integer',
                Rule::exists('wallets', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)
            ],
            'type' => 'required|integer|in:1,2',
            'target_name' => 'required|string|min:3|max:100',
            'target_amount' => 'required|numeric|min:1',
            'fee' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'due_date' => 'required|date_format:Y-m-d\TH:i',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), isList: true);
        }

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

        DB::beginTransaction();

        try {
            $debt = $this->debt->create([
                'wallet_id' => $request->wallet,
                'user_id' => $this->user->id,
                'type' => $request->type,
                'target_name' => $request->target_name,
                'target_amount' => $request->target_amount,
                'fee' => $request->fee,
                'description' => $request->description,
                'published_at' => $request->published_at,
                'due_date' => $request->due_date,
            ]);

            $amount = $request->target_amount + $request->fee;
            $debt->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $request->wallet,
                'type' => Mutation::TYPE_DB,
                'last_balance' => $wallet->balance,
                'amount' => $amount,
                'current_balance' => $wallet->balance - $amount,
                'description' => "Debt: remove {$amount} from {$wallet->name}",
            ]);

            $wallet->update([
                'balance' => $wallet->balance - $amount,
            ]);

            DB::commit();
            return MessageFixer::success('Debt created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function show(Debt $debt)
    {
        //
    }

    public function update(Request $request, Debt $debt)
    {
        //
    }

    public function destroy(Debt $debt)
    {
        //
    }
}
