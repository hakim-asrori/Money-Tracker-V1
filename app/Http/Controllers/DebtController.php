<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Models\Mutation;
use App\Models\Wallet;
use App\Services\WalletService;
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
        $arrayTitle = explode("/", $request->path());
        $title = array_pop($arrayTitle);
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        $debtQuery = $this->debt->query();
        $debtQuery->where('user_id', $this->user->id);
        $debtQuery->where('type', $title === "receivables" ? $this->debt::TYPE_CREDIT : $this->debt::TYPE_DEBIT);
        $debtQuery->with(['wallet', 'target', 'transaction']);
        $debtQuery->withSum('targets as total_remaining_amount', 'remaining_amount');
        $debts = $debtQuery->paginate();

        if ($title === "receivables") {
            return Inertia::render('debt/receivable/index', [
                'debts' => $debts,
                'wallets' => $wallets,
                'title' => ucwords($title)
            ]);
        } else {
            # code...
        }
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
            'title' => 'required|string|min:3|max:100',
            'target' => 'required|string|min:3|max:100',
            'amount' => 'required|numeric|min:0',
            'fee' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'due_date' => 'nullable|date_format:Y-m-d\TH:i',
        ]);

        $arrayTitle = explode("/", $request->path());
        $request->merge([
            'type' => array_pop($arrayTitle) === "receivables" ? $this->debt::TYPE_CREDIT : $this->debt::TYPE_DEBIT
        ]);

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

        DB::beginTransaction();

        try {
            $debt = $this->debt->create([
                'wallet_id' => $request->wallet,
                'user_id' => $this->user->id,
                'type' => $request->type,
                'title' => $request->title,
                'amount' => $request->amount,
                'fee' => $request->fee,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            $amount = $request->amount + $request->fee;
            $debt->target()->create([
                'name' => $request->target,
                'amount' => $amount,
                'remaining_amount' => $amount,
                'due_date' => $request->due_date,
            ]);

            WalletService::createWalletMutation($debt, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_DB);
            if ($request->fee > 0) {
                WalletService::createWalletMutation($debt, $this->user->id, $wallet->id, $request->fee, Mutation::TYPE_DB);
            }

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
