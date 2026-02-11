<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Enums\CategoryTypeConstant;
use App\Models\{Account, Category, Wallet};
use App\Services\JournalService;
use Exception;

class ReconcileAccountCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reconcile-account';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reconcile accounts with categories and wallets';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Reconciling categories...');
        $this->reconcileCategories();

        $this->info('Reconciling wallets...');
        $this->reconcileWallets();

        $this->info('✅ Accounts have been reconciled.');
        return Command::SUCCESS;
    }

    protected function reconcileCategories(): void
    {
        Category::whereNull('account_id')
            ->chunkById(50, function ($categories) {
                DB::transaction(function () use ($categories) {
                    foreach ($categories as $category) {
                        JournalService::attachAccountToCategory($category);
                    }
                });
            });
    }

    protected function reconcileWallets(): void
    {
        Wallet::whereNull('account_id')
            ->chunkById(50, function ($wallets) {
                DB::transaction(function () use ($wallets) {
                    foreach ($wallets as $wallet) {
                        JournalService::attachAccountToWallet($wallet);
                    }
                });
            });
    }
}
