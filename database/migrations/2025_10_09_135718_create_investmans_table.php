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
        Schema::create('investmans', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->references('id')->on('users');
            $table->foreignIdFor(Wallet::class)->references('id')->on('wallets');
            $table->string('title', 200);
            $table->float('profit_gain', 20, 2)->default(0);
            $table->float('profit_loss', 20, 2)->default(0);
            $table->enum('status', ['active', 'sold'])->default('active');
            $table->dateTime('purchase_at');
            $table->dateTime('sold_at')->default(null);
            $table->datetimes();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investmans');
    }
};
