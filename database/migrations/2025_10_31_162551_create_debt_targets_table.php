<?php

use App\Models\Debt;
use App\Models\User;
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
        Schema::create('debt_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Debt::class)->references('id')->on('debts');
            $table->foreignIdFor(User::class)->nullable()->references('id')->on('users'); // target_id (user yang berhutang)
            $table->string('name', 100)->nullable(); // kalau target bukan user terdaftar
            $table->float('amount', 20, 2)->default(0); // jumlah total yang harus dibayar
            $table->float('paid_amount', 20, 2)->default(0); // total yang sudah dibayar
            $table->float('remaining_amount', 20, 2)->default(0); // sisa hutang
            $table->tinyInteger('status')->default(0); // 0 = belum lunas, 1 = lunas
            $table->dateTime('due_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_targets');
    }
};
