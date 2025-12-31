<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\Rule;
use App\Models\{Mutation, Wallet, WalletTransfer};
use App\Services\WalletService;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class WalletTransferController extends Controller
{
    protected $user, $agent;
    public function __construct(protected Wallet $wallet, protected WalletTransfer $walletTransfer)
    {
        $this->user = Auth::user();
        $this->agent = new Agent();
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

        $walletTransferQuery->orderBy('published_at', 'desc');

        $walletTransfers = $walletTransferQuery->with(['walletOrigin', 'walletTarget'])->paginate();

        if ($this->agent->isMobile()) {
            return Inertia::render('mobile/wallet-transfer/index', [
                'wallets' => $wallets,
                'walletTransfers' => $walletTransfers,
            ]);
        }

        return Inertia::render('wallet-transfer', [
            'wallets' => $wallets,
            'filters' => $request->only('origin', 'target', 'publishedAt'),
            'walletTransfers' => $walletTransfers,
        ]);
    }


    public function create(Request $request)
    {
        if (!$this->agent->isMobile()) {
            return to_route('wallet-transfer.index');
        }

        if (!$request->has('origin')) {
            return to_route('wallet-transfer.index')->with('warning', 'Please select wallet origin');
        }

        $walletOrigin = $this->wallet->whereUserId($this->user->id)->find($request->get('origin'));
        $wallets = $this->wallet->where('user_id', $this->user->id)->where('id', '!=', $walletOrigin->id)->get();

        return Inertia::render('mobile/wallet-transfer/create', [
            'walletOrigin' => $walletOrigin,
            'wallets' => $wallets
        ]);
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
        if ($walletOrigin->balance < 1) {
            DB::rollBack();
            return redirect()->back()->with('warning', 'Wallet balance is not enough');
        }

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

            WalletService::createWalletMutation($walletTransfer, $this->user->id, $walletOrigin->id, $request->amount, Mutation::TYPE_DB);
            WalletService::createWalletMutation($walletTransfer, $this->user->id, $walletOrigin->id, $request->fee, Mutation::TYPE_DB);

            WalletService::createWalletMutation($walletTransfer, $this->user->id, $walletTarget->id, $request->amount, Mutation::TYPE_CR);

            DB::commit();

            if ($this->agent->isMobile()) {
                return to_route('wallet-transfer.show', $walletTransfer)->with('success', 'Wallet Transfer created successfully');
            }

            return to_route('wallet-transfer.index')->with('success', 'Wallet Transfer created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('warning', $th->getMessage());
        }
    }


    public function show(string $id)
    {
        if (!$this->agent->isMobile()) {
            return to_route('wallet-transfer.index');
        }

        $walletTransfer = $this->walletTransfer->with(['walletOrigin', 'walletTarget'])->find($id);
        if (!$walletTransfer) {
            return to_route('wallet-transfer.index')->with('warning', 'Wallet Transfer not found');
        }

        return Inertia::render('mobile/wallet-transfer/detail', [
            'walletTransfer' => $walletTransfer
        ]);
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
