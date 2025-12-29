<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{CategoryController, DashboardController, IncomeController, InvestmanController, MutationController, TransactionController, WalletController, WalletTransferController};
use App\Http\Controllers\Debt\{IndebtednesController, ReceivableController};
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
Route::get('/privacy', function () {
    return Inertia::render('privacy');
})->name('privacy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('category', CategoryController::class);
    Route::resource('wallet', WalletController::class);
    Route::resource('income', IncomeController::class);

    Route::prefix('debt')->group(function () {
        Route::post('receivables/payment/{receivable}', [ReceivableController::class, 'payment'])->name('debt.receivables.payment');
        Route::resource('receivables', ReceivableController::class)
            ->names('debt.receivables');

        Route::resource('indebtedness', IndebtednesController::class)
            ->names('debt.indebtedness');
    });

    Route::post('transaction/debt/payment/{target}', [TransactionController::class, 'debtPayment'])->name('transaction.debt.payment');
    Route::resource('transaction', TransactionController::class);
    Route::resource('mutation', MutationController::class);
    Route::resource('wallet-transfer', WalletTransferController::class);
    Route::resource('investman', InvestmanController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
