<?php

namespace App\Http\Controllers;

use App\Models\Mutation;
use App\Models\Wallet;
use App\Models\WalletTransfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WalletTransferController extends Controller
{
    protected $user;
    public function __construct(protected Wallet $wallet, protected WalletTransfer $walletTransfer)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        $walletTransferQuery = $this->walletTransfer->query();
        $walletTransferQuery->where('user_id', $this->user->id);

        $walletTransferQuery->when($request->has('origin') && $request->get('origin') != '-1' && $request->filled('origin'), function ($query) use ($request) {
            $query->where('wallet_origin_id', $request->get('origin'));
        });

        $walletTransferQuery->when($request->has('target') && $request->get('target') != '-1' && $request->filled('target'), function ($query) use ($request) {
            $query->where('wallet_target_id', $request->get('target'));
        });

        $walletTransferQuery->when($request->has('publishedAt') && $request->filled('publishedAt'), function ($query) use ($request) {
            $query->whereDate('published_at', $request->get('publishedAt'));
        });

        $walletTransfers = $walletTransferQuery->with(['walletOrigin', 'walletTarget'])->paginate();

        return Inertia::render('wallet-transfer', [
            'wallets' => $wallets,
            'filters' => $request->only('origin', 'target', 'publishedAt'),
            'walletTransfers' => $walletTransfers,
        ]);
    }


    public function create()
    {
        //
    }


    public function store(Request $request)
    {
        $request->validate([
            'wallet_origin' => [
                'required',
                'integer',
                Rule::exists('wallets', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)
            ],
            'wallet_target' => [
                'required',
                'integer',
                'different:wallet_origin',
                Rule::exists('wallets', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id),
            ],
            'amount' => 'required|numeric|min:0',
            'fee' => 'required|numeric|min:0',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        DB::beginTransaction();

        $walletOrigin = $this->wallet->whereUserId($this->user->id)->find($request->wallet_origin);
        $walletTarget = $this->wallet->whereUserId($this->user->id)->find($request->wallet_target);

        $amount = $request->amount + $request->fee;
        if ($amount > $walletOrigin->balance) {
            DB::rollBack();
            return redirect()->back()->with('warning', 'Insufficient balance');
        }

        try {
            $walletTransfer = $this->walletTransfer->create([
                'user_id' => $this->user->id,
                'wallet_origin_id' => $request->wallet_origin,
                'wallet_target_id' => $request->wallet_target,
                'amount' => $request->amount,
                'fee' => $request->fee,
                'published_at' => $request->published_at,
            ]);

            $walletTransfer->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $request->wallet_origin,
                'type' => Mutation::TYPE_DB,
                'last_balance' => $walletOrigin->balance,
                'amount' => $amount,
                'current_balance' => $walletOrigin->balance - $amount,
                'description' => "Wallet Transfer: remove {$amount} from {$walletOrigin->name}",
            ]);
            $walletTransfer->mutation()->create([
                'user_id' => $this->user->id,
                'wallet_id' => $request->wallet_target,
                'type' => Mutation::TYPE_CR,
                'last_balance' => $walletTarget->balance,
                'amount' => $request->amount,
                'current_balance' => $walletTarget->balance + $request->amount,
                'description' => "Wallet Transfer: add {$request->amount} to {$walletTarget->name}",
            ]);

            $walletOrigin->update([
                'balance' => $walletOrigin->balance - $amount,
            ]);
            $walletTarget->update([
                'balance' => $walletTarget->balance + $amount,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Wallet Transfer created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('warning', $th->getMessage());
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
