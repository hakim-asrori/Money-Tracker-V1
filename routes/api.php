<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\Debt\ReceivableController;
use App\Http\Controllers\API\IncomeController;
use App\Http\Controllers\API\InvestmanController;
use App\Http\Controllers\API\MutationController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\WalletController;
use App\Http\Controllers\API\WalletTransferController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('category/types', [CategoryController::class, 'types']);

    Route::apiResource('category', CategoryController::class, [
        "as" => "api"
    ]);

    Route::post('debt/receivable/payment/{receivable}', [ReceivableController::class, 'payment'])->name('api.debt.receivable.payment');
    Route::apiResource('debt/receivable', ReceivableController::class, [
        "as" => "api.debt"
    ]);

    Route::apiResource('income', IncomeController::class, [
        "as" => "api"
    ]);

    Route::apiResource('investman', InvestmanController::class, [
        "as" => "api"
    ]);

    Route::get('mutation/groups', [MutationController::class, 'mutationGroups']);
    Route::apiResource('mutation', MutationController::class, [
        "as" => "api"
    ]);

    Route::post('transaction/debt/payment/{target}', [TransactionController::class, 'debtPayment'])->name('api.transaction.debt.payment');
    Route::apiResource('transaction', TransactionController::class, [
        "as" => "api"
    ]);

    Route::apiResource('wallet', WalletController::class, [
        "as" => "api"
    ]);

    Route::apiResource('wallet-transfer', WalletTransferController::class, [
        "as" => "api"
    ]);
});
