<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Mutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MutationController extends Controller
{
    protected $user;

    public function __construct(protected Mutation $mutation)
    {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $mutationQuery = $this->mutation->query();
        $mutationQuery->when($request->has('wallet') && $request->get('wallet') != '-1' && $request->filled('wallet'), function ($query) use ($request) {
            $query->where('wallet_id', $request->get('wallet'));
        });
        $mutationQuery->when($request->has('inquiry') && $request->get('inquiry') != '-1' && $request->filled('inquiry'), function ($query) use ($request) {
            $query->where('mutable_type', "App\\Models\\{$request->get('inquiry')}");
        });
        $mutationQuery->when($request->has('type') && $request->get('type') != '-1' && $request->filled('type'), function ($query) use ($request) {
            $query->where('type', $request->get('type'));
        });
        $mutationQuery->when($request->has('publishedAt') && $request->filled('publishedAt'), function ($query) use ($request) {
            $query->whereDate('created_at', $request->get('publishedAt'));
        });

        $mutationQuery->where('user_id', $this->user->id);

        $mutationQuery->with(['wallet', 'mutable']);
        $mutationQuery->orderByDesc('created_at')->orderByDesc('id');

        if ($request->boolean('paginate')) {
            $mutations = $mutationQuery->paginate($request->integer('perPage', 10));
            return MessageFixer::paginate('Mutations', $mutations);
        }

        $mutations = $mutationQuery->get();
        return MessageFixer::success('Mutations', $mutations);
    }

    public function mutationGroups(Request $request)
    {
        $mutationQuery = $this->mutation->query();
        $inquiryGroups = $mutationQuery->get()->groupBy(fn($m) => $m->mutable_type);
        $inquiryGroups = $inquiryGroups->keys()->map(fn($key) => class_basename($key))->toArray();

        $walletGroups = $mutationQuery
            ->with('wallet')
            ->get()
            ->groupBy('wallet_id')
            ->map(function ($mutations, $walletId) {
                $walletName = optional($mutations->first()->wallet)->name ?? 'Unknown';
                return [
                    "key" => $walletId,
                    "value" => $walletName
                ];
            })
            ->values()
            ->toArray();

        return MessageFixer::success('Mutation groups', [
            'inquiry_groups' => $inquiryGroups,
            'wallet_groups' => $walletGroups,
            'types' => [Mutation::TYPE_CR, Mutation::TYPE_DB]
        ]);
    }

    public function store(Request $request)
    {
        //
    }

    public function show(Mutation $mutation)
    {
        //
    }

    public function update(Request $request, Mutation $mutation)
    {
        //
    }

    public function destroy(Mutation $mutation)
    {
        //
    }
}
