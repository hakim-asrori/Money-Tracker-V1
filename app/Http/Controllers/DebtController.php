<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Models\Mutation;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DebtController extends Controller
{
    protected $user;

    public function __construct(protected Debt $debt, protected Wallet $wallet)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        return Inertia::render('debt', []);
    }


    public function create()
    {
        //
    }


    public function store(Request $request)
    {
        $request->validate([
            'wallet' => [
                'required',
                'integer',
                Rule::exists('wallets', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)
            ],
            'type' => 'required|integer|in:1,2',
            'target_name' => 'required|string|min:3|max:100',
            'target_amount' => 'required|numeric|min:0',
            'fee' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'due_date' => 'required|date_format:Y-m-d\TH:i',
        ]);

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
            return redirect()->back()->with('success', 'Debt created successfully');
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


    public function update(Request $request, string $id)
    {
        //
    }


    public function destroy(string $id)
    {
        //
    }
}
