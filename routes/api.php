<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\DebtController;
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
    Route::apiResource('category', CategoryController::class);
    Route::apiResource('debt', DebtController::class);
    Route::apiResource('income', IncomeController::class);
    Route::apiResource('investman', InvestmanController::class);
    Route::apiResource('mutation', MutationController::class);
    Route::apiResource('transaction', TransactionController::class);
    Route::apiResource('wallet', WalletController::class);
    Route::apiResource('wallet-transfer', WalletTransferController::class);
});
