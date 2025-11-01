<?php

namespace App\Http\Controllers;

use App\Models\Mutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
        $mutationQueryClone = clone $mutationQuery;

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
        $mutations = $mutationQuery->paginate($request->get('perPage', 10));

        $inquiryGroups = $mutationQueryClone->get()->groupBy(fn($m) => $m->mutable_type);
        $inquiryGroups = $inquiryGroups->keys()->map(fn($key) => class_basename($key))->toArray();

        $walletGroups = $mutationQueryClone
            ->with('wallet')
            ->get()
            ->groupBy('wallet_id')
            ->mapWithKeys(function ($mutations, $walletId) {
                $walletName = optional($mutations->first()->wallet)->name ?? 'Unknown';
                return [$walletId => $walletName];
            })
            ->toArray();

        return Inertia::render('mutation', [
            'mutations' => $mutations,
            'inquiryGroups' => $inquiryGroups,
            'walletGroups' => $walletGroups,
            'filters' => $request->only('wallet', 'type', 'inquiry', 'publishedAt'),
        ]);
    }
}
