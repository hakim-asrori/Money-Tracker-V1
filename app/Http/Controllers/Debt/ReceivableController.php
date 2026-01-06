<?php

namespace App\Http\Controllers\Debt;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\{Debt, DebtTarget, Mutation, Wallet};
use App\Services\WalletService;
use Inertia\Inertia;

class ReceivableController extends Controller
{
    protected $user;

    public function __construct(protected Debt $debt, protected Wallet $wallet)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        $debtQuery = $this->debt->query();
        $debtQuery->where('user_id', $this->user->id);
        $debtQuery->where('type', $this->debt::TYPE_CREDIT);
        $debtQuery->with(['wallet', 'target.debtPayments.walletTarget', 'transaction']);
        $debtQuery->withSum('targets as total_remaining_amount', 'remaining_amount');
        $debtQuery->withSum('targets as total_paid_amount', 'paid_amount');
        $debts = $debtQuery->paginate();

        return Inertia::render('debt/receivable/index', [
            'debts' => $debts,
            'wallets' => $wallets,
        ]);
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
            'amount' => 'required|numeric|min:1',
            'fee' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'due_date' => 'nullable|date_format:Y-m-d\TH:i',
        ]);

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

        DB::beginTransaction();

        try {
            $debt = $this->debt->create([
                'wallet_id' => $request->wallet,
                'user_id' => $this->user->id,
                'type' => $this->debt::TYPE_CREDIT,
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
            return redirect()->back()->with('success', 'Debt receivable created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function show(string $id)
    {
        abort(404);
    }


    public function update(Request $request, Debt $receivable)
    {
        $request->validate([
            'title' => 'required|string|min:3|max:100',
            'target' => 'required|string|min:3|max:100',
            'description' => 'required|string|min:3|max:255',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'due_date' => 'nullable|date_format:Y-m-d\TH:i',
        ]);


        DB::beginTransaction();

        try {
            $receivable->update([
                'title' => $request->title,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            $receivable->target()->update([
                'name' => $request->target,
                'due_date' => $request->due_date,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Debt receivable updated successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }

    public function payment(Request $request, Debt $receivable)
    {
        $request->validate([
            'wallet' => [
                'required',
                'integer',
                Rule::exists('wallets', 'id')->whereNull('deleted_at')->where('user_id', $this->user->id)
            ],
            'amount' => 'required|numeric|min:1',
            'note' => 'nullable|string|min:3|max:255',
            'paid_at' => 'required|date_format:Y-m-d\TH:i',
        ]);

        DB::beginTransaction();

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);

        if ($request->amount > $receivable->target->remaining_amount) {
            return redirect()->back()->with('error', 'Amount is greater than remaining amount');
        }

        try {
            $receivable->target()->increment('paid_amount', $request->amount);
            $receivable->target()->decrement('remaining_amount', $request->amount);
            if ($receivable->target->remaining_amount == 0) {
                $receivable->target()->update([
                    'status' => DebtTarget::STATUS_PAID
                ]);
            }

            $receivable->target->debtPayments()->create([
                'user_id' => $this->user->id,
                'wallet_target_id' => $wallet->id,
                'amount' => $request->amount,
                'note' => $request->note,
                'paid_at' => $request->paid_at,
            ]);

            WalletService::createWalletMutation($receivable, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_CR);

            DB::commit();
            return redirect()->back()->with('success', 'Payment made successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function destroy(Debt $receivable)
    {
        DB::beginTransaction();

        try {
            if ($receivable->target->debtPayments->count() > 0) {
                foreach ($receivable->target->debtPayments as $debtPayment) {
                    WalletService::createWalletMutation($debtPayment, $this->user->id, $debtPayment->wallet_target_id, $debtPayment->amount, Mutation::TYPE_DB);
                }

                $receivable->target->debtPayments()->delete();
            }

            $receivable->target()->delete();

            $amount = $receivable->amount + $receivable->fee;
            WalletService::createWalletMutation($receivable, $this->user->id, $receivable->wallet_id, $amount, Mutation::TYPE_CR);

            $receivable->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Debt receivable deleted successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
