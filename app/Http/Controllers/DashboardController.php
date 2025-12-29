<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Debt, Income, Mutation, Transaction, WalletTransfer};
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $mutationChart = Mutation::selectRaw('
            date(created_at) as date,
            SUM(CASE WHEN type = "db" THEN amount ELSE 0 END) as total_db,
            SUM(CASE WHEN type = "cr" THEN amount ELSE 0 END) as total_cr
        ')
            ->orderBy('date', 'asc')
            ->groupBy('date')
            ->get();

        $totalIncomes = Income::sum('amount');
        $totalTransactions = Transaction::sum('amount');
        $totalTransfers = WalletTransfer::sum('amount');
        $totalDebts = Debt::sum('amount');

        return Inertia::render('dashboard', [
            'mutationChart' => $mutationChart,
            'summaries' => [
                'totalIncomes' => $totalIncomes,
                'totalTransactions' => $totalTransactions,
                'totalTransfers' => $totalTransfers,
                'totalDebts' => $totalDebts
            ]
        ]);
    }
}
