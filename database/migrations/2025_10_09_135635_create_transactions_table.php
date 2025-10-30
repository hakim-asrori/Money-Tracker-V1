<?php

use App\Models\Category;
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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->references('id')->on('users');
            $table->foreignIdFor(Wallet::class)->references('id')->on('wallets');
            $table->foreignIdFor(Category::class)->references('id')->on('categories');
            $table->string('title', 200);
            $table->float('amount', 20, 2)->default(0);
            $table->float('fee', 20, 2)->default(0);
            $table->string('description', 255);
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
        Schema::dropIfExists('transactions');
    }
};
