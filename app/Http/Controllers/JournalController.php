<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Exports\JournalExport;
use App\Models\{JournalEntry, Mutation};
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $journals = JournalEntry::where('user_id', $user->id)->with(['lines.account'])->orderBy('created_at', 'asc')->get();

        $lines = $journals->flatMap->lines;
        $summary = [
            "totalDebit" => $lines->sum('debit'),
            "totalCredit" => $lines->sum('credit')
        ];

        return Inertia::render('report/journal', [
            'journals' =>  $journals,
            'summary' => $summary
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
