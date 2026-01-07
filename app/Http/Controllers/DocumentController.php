<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\Rule;
use App\Enums\CategoryTypeConstant;
use App\Models\{Category, Debt, Document, DocumentSource, Mutation, Transaction, Wallet};
use App\Services\WalletService;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class DocumentController extends Controller
{
    protected $user;

    public function __construct(
        protected Document $document,
        protected Agent $agent,
        protected DocumentSource $documentSource,
        protected Category $category,
        protected Wallet $wallet,
        protected Transaction $transaction,
    ) {
        $this->user = Auth::user();
    }

    public function index()
    {
        if (!$this->agent->isMobile()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('mobile/document/index');
    }

    public function create(Request $request)
    {
        if (!$this->agent->isMobile()) {
            return redirect()->route('dashboard');
        }

        if (!$request->has('source')) {
            return to_route('dashboard')->with('warning', 'Please select source');
        }

        $source = $this->documentSource->find($request->source);
        if (!$source) {
            return to_route('dashboard')->with('warning', 'Source not found');
        }

        $categories = $this->category->where('user_id', $this->user->id)->where('type', CategoryTypeConstant::TRANSACTION->value)->get();
        $wallets = $this->wallet->where('user_id', $this->user->id)->get();

        return Inertia::render('mobile/document/create', [
            'source' => $source,
            'categories' => $categories,
            'wallets' => $wallets
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'wallet' => ['required', 'integer', Rule::exists('wallets', 'id')->where('user_id', $this->user->id)->whereNull('deleted_at')],
            'title' => 'required|string|min:3|max:200',
            'amount' => 'required|numeric|min:1',
            'fee' => 'required|numeric|min:0',
            'description' => 'required|string|min:3|max:200',
            'published_at' => 'required|date_format:Y-m-d\TH:i',
            'is_debt' => 'nullable|boolean',
            'targets' => 'required_if:is_debt,true|array',
            'targets.*.user_id' => 'nullable|integer|exists:users,id',
            'targets.*.name' => 'required_without:targets.*.user_id|string|min:3|max:100',
            'targets.*.amount' => 'required|numeric|min:0',
            'source' => ['required', 'integer', Rule::exists('document_sources', 'id')->whereNull('deleted_at')],
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'raw_text' => 'required|string',
        ]);

        $wallet = $this->wallet->where('user_id', $this->user->id)->find($request->wallet);
        if ($wallet->balance < 1) {
            return redirect()->back()->with('error', 'Wallet balance is not enough');
        }

        DB::beginTransaction();

        try {
            $transaction = $this->transaction->create([
                'user_id' => $this->user->id,
                'category_id' => $request->category,
                'wallet_id' => $request->wallet,
                'title' => $request->title,
                'amount' => $request->amount,
                'fee' => $request->fee,
                'description' => $request->description,
                'published_at' => $request->published_at,
            ]);

            $transaction->document()->create([
                'user_id' => $this->user->id,
                'source_id' => $request->source,
                'original_image' => $request->file('image')->store("documents/{$this->user->id}", 'public'),
                'raw_text' => $request->raw_text,
            ]);

            if ($request->boolean('is_debt')) {
                $debt = $transaction->debt()->create([
                    'user_id' => $this->user->id,
                    'wallet_id' => $wallet->id,
                    'type' => Debt::TYPE_CREDIT,
                    'title' => $request->title,
                    'amount' => $request->amount + $request->fee,
                    'description' => $request->description,
                    'published_at' => $request->published_at,
                ]);

                foreach ($request->targets as $target) {
                    $debt->targets()->create([
                        'user_id' => $target['user_id'] ?? null,
                        'name' => $target['name'] ?? null,
                        'amount' => (float) $target['amount'],
                        'remaining_amount' => (float) $target['amount'],
                    ]);
                }
            }

            WalletService::createWalletMutation($transaction, $this->user->id, $wallet->id, $request->amount, Mutation::TYPE_DB);
            if ($request->fee > 0) {
                WalletService::createWalletMutation($transaction, $this->user->id, $wallet->id, $request->fee, Mutation::TYPE_DB);
            }

            DB::commit();
            return redirect()->route('transaction.index')->with('success', 'Transaction successfully created');
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
