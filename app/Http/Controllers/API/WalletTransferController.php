<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Mutation;
use App\Models\Wallet;
use App\Models\WalletTransfer;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class WalletTransferController extends Controller
{
    protected $user;
    public function __construct(protected Wallet $wallet, protected WalletTransfer $walletTransfer)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $walletTransferQuery = $this->walletTransfer
            ->where('user_id', $this->user->id)
            ->with(['walletOrigin', 'walletTarget'])
            ->when(
                $request->filled('origin') && $request->get('origin') != '-1',
                fn($q) => $q->where('wallet_origin_id', $request->get('origin'))
            )
            ->when(
                $request->filled('target') && $request->get('target') != '-1',
                fn($q) => $q->where('wallet_target_id', $request->get('target'))
            )
            ->when(
                $request->filled('publishedAt'),
                fn($q) => $q->whereDate('published_at', $request->get('publishedAt'))
            )
            ->orderByDesc('created_at');

        if ($request->boolean('paginate')) {
            $walletTransfers = $walletTransferQuery->paginate($request->integer('perPage', 10));
            return MessageFixer::paginate('Wallet Transfers', $walletTransfers);
        }

        $walletTransfers = $walletTransferQuery->get();
        return MessageFixer::success('Wallet Transfers', $walletTransfers);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
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

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        $walletOrigin = $this->wallet->whereUserId($this->user->id)->find($request->wallet_origin);
        $walletTarget = $this->wallet->whereUserId($this->user->id)->find($request->wallet_target);

        $amount = $request->amount + $request->fee;
        if ($amount > $walletOrigin->balance) {
            return MessageFixer::error('Insufficient balance');
        }

        DB::beginTransaction();

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
            return MessageFixer::success('Wallet Transfer created successfully', $walletTransfer);
        } catch (\Exception $e) {
            DB::rollBack();
            return MessageFixer::error($e->getMessage());
        }
    }

    public function show($id)
    {
        $walletTransfer = $this->walletTransfer->with(['walletOrigin', 'walletTarget'])->find($id);
        if (!$walletTransfer) {
            return MessageFixer::notFound('Wallet Transfer not found');
        }

        return MessageFixer::success('Wallet Transfer', $walletTransfer);
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}
