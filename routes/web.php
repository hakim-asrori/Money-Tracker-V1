<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{CategoryController, DashboardController, DocumentController, IncomeController, InvestmanController, JournalController, MutationController, TransactionController, WalletController, WalletTransferController};
use App\Http\Controllers\Debt\{IndebtednesController, ReceivableController};
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

Route::get('/', function () {
    // Create token header as a JSON string
    $header = json_encode(['type' => 'JWT', 'alg' => 'HS256']);
    // Create token payload as a JSON string
    $payload = json_encode((object) []);
    // Encode Header to Base64Url String
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    // Encode Payload to Base64Url String
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    // Create Signature Hash
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'b24xaE1RRklCNjNOS0sxQQ==', true);
    // Encode Signature to Base64Url String
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    // Create JWT
    $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    dd($jwt, $header, $payload, $base64UrlHeader, $base64UrlPayload, $signature, $base64UrlSignature);
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
        Route::get('/', function () {
            $agent = new Agent();

            if ($agent->isMobile()) {
                return Inertia::render('mobile/debt/index');
            }

            return to_route('debt.receivables.index');
        })->name('debt.index');

        Route::post('receivables/payment/{receivable}', [ReceivableController::class, 'payment'])->name('debt.receivables.payment');
        Route::resource('receivables', ReceivableController::class)
            ->names('debt.receivables');

        Route::resource('indebtedness', IndebtednesController::class)
            ->names('debt.indebtedness');
    });

    Route::post('transaction/debt/payment/{target}', [TransactionController::class, 'debtPayment'])->name('transaction.debt.payment');
    Route::resource('transaction', TransactionController::class);
    Route::resource('wallet-transfer', WalletTransferController::class);
    Route::resource('investman', InvestmanController::class);
    Route::resource('document', DocumentController::class);

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('mutation', MutationController::class)->name('mutation');

        Route::prefix('journal')->name('journal.')->group(function () {
            Route::get('/', [JournalController::class, 'index'])->name('index');
            Route::get('/export-{type}', [JournalController::class, 'export'])->name('export');
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
