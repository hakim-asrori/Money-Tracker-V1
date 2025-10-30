<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\Mutation;
use Illuminate\Http\Request;

class MutationController extends Controller
{
    public function __construct(protected Mutation $mutation) {}

    public function index(Request $request)
    {
        $mutationQuery = $this->mutation
            ->with(['wallet', 'mutable'])
            ->orderByDesc('created_at');

        if ($request->boolean('paginate')) {
            $mutations = $mutationQuery->paginate($request->integer('perPage', 10));
            return MessageFixer::paginate('Mutations', $mutations);
        }

        $mutations = $mutationQuery->get();
        return MessageFixer::success('Mutations', $mutations);
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
