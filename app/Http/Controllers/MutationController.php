<?php

namespace App\Http\Controllers;

use App\Models\Mutation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MutationController extends Controller
{
    public function __construct(protected Mutation $mutation) {}

    public function index(Request $request)
    {
        $mutationQuery = $this->mutation->query();
        $mutationQuery->with(['wallet', 'mutable']);
        $mutationQuery->orderBy('created_at', 'desc');
        $mutations = $mutationQuery->paginate($request->get('perPage', 10));

        return Inertia::render('mutation', [
            'mutations' => $mutations
        ]);
    }
}
