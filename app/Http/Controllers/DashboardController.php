<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Debt, DocumentSource, Income, Mutation, Transaction, Wallet, WalletTransfer};
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $agent = new Agent();
        $user = $request->user();

        $totalIncomes = Income::where('user_id', $user->id)->sum('amount');
        $totalTransactions = Transaction::where('user_id', $user->id)->sum('amount');
        $totalTransfers = WalletTransfer::where('user_id', $user->id)->sum('amount');
        $totalDebts = Debt::where('user_id', $user->id)->sum('amount');

        $totalBalance = Wallet::where('user_id', $user->id)->sum('balance');

        if ($agent->isMobile()) {
            $documentSources = DocumentSource::all();

            return Inertia::render('mobile/dashboard', [
                'summaries' => [
                    'totalIncomes' => $totalIncomes,
                    'totalTransactions' => $totalTransactions,
                    'totalTransfers' => $totalTransfers,
                    'totalDebts' => $totalDebts,
                    'totalBalance' => $totalBalance
                ],
                'documentSources' => $documentSources
            ]);
        }

        $mutationChart = Mutation::selectRaw('
            date(created_at) as date,
            SUM(CASE WHEN type = "db" THEN amount ELSE 0 END) as total_db,
            SUM(CASE WHEN type = "cr" THEN amount ELSE 0 END) as total_cr
        ')
            ->where('user_id', $user->id)
            ->orderBy('date', 'asc')
            ->groupBy('date')
            ->get();

        return Inertia::render('dashboard', [
            'mutationChart' => $mutationChart,
            'summaries' => [
                'totalIncomes' => $totalIncomes,
                'totalTransactions' => $totalTransactions,
                'totalTransfers' => $totalTransfers,
                'totalDebts' => $totalDebts,
                'totalBalance' => $totalBalance
            ]
        ]);
    }
}
