<?php

use App\Models\DebtTarget;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(DebtTarget::class)->nullable()->references('id')->on('debt_targets');
            $table->foreignIdFor(Wallet::class, 'wallet_origin_id')->nullable()->references('id')->on('wallets');
            $table->foreignIdFor(Wallet::class, 'wallet_target_id')->nullable()->references('id')->on('wallets');
            $table->foreignIdFor(User::class)->nullable()->references('id')->on('users'); // siapa yang membayar
            $table->float('amount', 20, 2)->default(0);
            $table->string('note', 255)->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_payments');
    }
};
