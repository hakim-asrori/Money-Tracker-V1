<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\{Account, Debt, JournalEntry, JournalLine, Wallet};
use Carbon\Carbon;

class GenerateOpeningCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-opening
                            {--date= : Opening balance date (Y-m-d)}
                            {--dry-run : Run without inserting data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate opening balance journal from existing data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $date = $this->option('date')
            ? Carbon::parse($this->option('date'))
            : Carbon::now();

        $dryRun = $this->option('dry-run');

        $this->info('Opening Journal Date: ' . $date->toDateString());
        if ($dryRun) {
            $this->warn('DRY RUN MODE (no data will be inserted)');
        }

        $walletsByUser = Wallet::where('balance', '>', 0)
            ->with('user')
            ->get()
            ->groupBy('user_id');

        foreach ($walletsByUser as $userId => $wallets) {

            DB::transaction(function () use ($userId, $wallets, $date, $dryRun) {

                // 1️⃣ Opening Equity per USER
                $openingEquity = Account::firstOrCreate(
                    [
                        'code' => '300-OPEN',
                        'user_id' => $userId
                    ],
                    [
                        'name' => 'Equity - Opening Balance',
                        'type' => 'equity',
                        'is_active' => true
                    ]
                );

                // 2️⃣ Journal Entry per USER
                $journalEntry = !$dryRun
                    ? JournalEntry::create([
                        'user_id' => $userId,
                        'journal_date' => $date,
                        'description' => 'Opening Balance Migration'
                    ])
                    : null;

                // 3️⃣ WALLET OPENING
                foreach ($wallets as $wallet) {

                    if (!$wallet->account_id) {
                        throw new \Exception("Wallet {$wallet->name} has no account");
                    }

                    if (!$dryRun) {
                        JournalLine::create([
                            'journal_entry_id' => $journalEntry->id,
                            'account_id' => $wallet->account_id,
                            'debit' => $wallet->balance,
                            'credit' => 0,
                            'description' => "Opening wallet: {$wallet->name}"
                        ]);

                        JournalLine::create([
                            'journal_entry_id' => $journalEntry->id,
                            'account_id' => $openingEquity->id,
                            'debit' => 0,
                            'credit' => $wallet->balance,
                            'description' => "Offset opening wallet: {$wallet->name}"
                        ]);
                    }
                }

                // 4️⃣ HUTANG per USER
                // $debts = Debt::where('user_id', $userId)
                //     ->with('targets')
                //     ->get();

                // foreach ($debts as $debt) {

                //     $remaining = $debt->targets->sum('remaining_amount');
                //     if ($remaining <= 0) {
                //         continue;
                //     }

                //     if (!$dryRun) {
                //         JournalLine::create([
                //             'journal_entry_id' => $journalEntry->id,
                //             'account_id' => $openingEquity->id,
                //             'debit' => $remaining,
                //             'credit' => 0
                //         ]);

                //         JournalLine::create([
                //             'journal_entry_id' => $journalEntry->id,
                //             'account_id' => $debt->account_id,
                //             'debit' => 0,
                //             'credit' => $remaining
                //         ]);
                //     }
                // }
            });
        }


        $this->info('Opening journal generation completed.');
        return Command::SUCCESS;
    }
}
