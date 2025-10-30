<?php

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
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->references('id')->on('users');
            $table->foreignIdFor(Wallet::class)->references('id')->on('wallets');
            $table->tinyInteger('type')->default(1);
            $table->string('target_name', 100);
            $table->float('target_amount', 20, 2)->default(0);
            $table->float('fee', 20, 2)->default(0);
            $table->string('description', 255);
            $table->dateTime('due_date');
            $table->dateTime('published_at');
            $table->datetimes();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
