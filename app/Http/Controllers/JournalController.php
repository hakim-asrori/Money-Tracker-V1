<?php

namespace App\Http\Controllers;

use App\Exports\JournalExport;
use App\Models\Mutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $mutations = Mutation::query()
            ->with(['wallet', 'mutable'])
            ->where('user_id', $user->id)
            ->when($request->filled('month') && $request->filled('year'), function ($query) use ($request) {
                $query->whereMonth('created_at', $request->get('month'));
                $query->whereYear('created_at', $request->get('year'));
            })
            ->orderBy('created_at', 'asc')
            ->get();
        $grouped = $mutations->groupBy(function ($item) {
            return $item->created_at->format('d F Y');
        });
        $journals = $grouped->map(function ($rows, $date) {
            return [
                'date' => $date,
                'items' => $rows->map(function ($row) {
                    return [
                        'wallet'   => $row->wallet->name ?? 'Unknown',
                        'description' => $row->mutable->title ?? $row->description,
                        'debet'  => $row->type === 'db' ? $row->amount : '-',
                        'credit' => $row->type === 'cr' ? $row->amount : '-',
                    ];
                })
            ];
        });

        if ($request->filled('month') && $request->filled('year') && $journals->count() > 0) {
            $type = 'ready';
        } else if ($request->filled('month') && $request->filled('year') && $journals->count() < 1) {
            $type = 'empty';
        } else {
            $type = 'not-ready';
        }

        return Inertia::render('report/journal', [
            'journals' =>  $request->filled('month') && $request->filled('year') ? $journals : [],
            'type' => $type
        ]);
    }

    public function export($type, Request $request)
    {
        if ($type === 'excel') {
            $request->validate([
                'year' => 'required|integer',
                'month' => 'required|integer',
            ]);

            return Excel::download(new JournalExport($request->get('year'), $request->get('month'), Auth::user()->id), "journal-{$request->get('year')}-{$request->get('month')}.xlsx");
        }

        return abort(404);
    }
}
