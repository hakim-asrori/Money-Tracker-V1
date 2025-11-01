<?php

namespace App\Services;

use App\Models\Mutation;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class WalletService
{
    public static function createWalletMutation($mutationable, int $userId, int $walletId, float $amount, string $type, ?string $description = null)
    {
        return DB::transaction(function () use ($mutationable, $userId, $walletId, $amount, $type, $description) {
            $wallet = Wallet::lockForUpdate()->findOrFail($walletId);

            if (!in_array($type, [Mutation::TYPE_CR, Mutation::TYPE_DB])) {
                throw new \InvalidArgumentException("Invalid mutation type");
            }

            $lastBalance = $wallet->balance;
            $currentBalance = $type === Mutation::TYPE_CR
                ? $lastBalance + $amount
                : $lastBalance - $amount;

            if ($currentBalance < 0) {
                throw new \Exception("Insufficient balance for debit transaction.");
            }

            // Create via polymorph relation
            $mutation = $mutationable->mutation()->create([
                'user_id' => $userId,
                'wallet_id' => $walletId,
                'type' => $type,
                'last_balance' => $lastBalance,
                'amount' => $amount,
                'current_balance' => $currentBalance,
                'description' => $description ?? self::defaultDescription($type, $amount, $wallet->name),
            ]);

            // Update wallet balance
            $wallet->update(['balance' => $currentBalance]);

            return $mutation;
        });
    }

    protected static function defaultDescription(string $type, float $amount, string $walletName): string
    {
        return $type === Mutation::TYPE_CR
            ? "Credit: add {$amount} to {$walletName}"
            : "Debit: subtract {$amount} from {$walletName}";
    }
}
