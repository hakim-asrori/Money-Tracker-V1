<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\InvestmanController;
use App\Http\Controllers\MutationController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\WalletTransferController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('category', CategoryController::class);
    Route::resource('wallet', WalletController::class);
    Route::resource('income', IncomeController::class);
    Route::resource('debt', DebtController::class);

    Route::post('transaction/debt/payment/{target}', [TransactionController::class, 'debtPayment'])->name('transaction.debt.payment');
    Route::resource('transaction', TransactionController::class);
    Route::resource('mutation', MutationController::class);
    Route::resource('wallet-transfer', WalletTransferController::class);
    Route::resource('investman', InvestmanController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
