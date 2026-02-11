<?php

namespace App\Services;

use App\Models\{Account, Category, Wallet};
use Exception;

class JournalService
{
    public static function attachAccountToWallet(Wallet $wallet, bool $isEdit = false): void
    {
        $accountName = 'Cash - ' . $wallet->name;

        if ($isEdit && $wallet->account_id) {
            // 🔄 EDIT MODE: update nama account saja
            $account = Account::where('id', $wallet->account_id)->first();

            if ($account && $account->name !== $accountName) {
                $account->update([
                    'name' => $accountName,
                ]);
            }

            return;
        }

        // 🆕 CREATE MODE: create or attach account
        $account = Account::firstOrCreate(
            [
                'user_id' => $wallet->user_id,
                'type'    => 'asset',
                'name'    => $accountName,
            ],
            [
                'code' => self::generateAccountCode('asset', $wallet->user_id),
            ]
        );

        if ($wallet->account_id !== $account->id) {
            $wallet->update([
                'account_id' => $account->id,
            ]);
        }
    }

    public static function attachAccountToCategory(Category $category, bool $isEdit = false): void
    {
        $type = self::mapCategoryTypeToAccountType($category->type);
        $accountName = ucfirst($type) . ' - ' . $category->name;

        if ($isEdit && $category->account_id) {
            // 🔄 EDIT MODE: update nama account saja
            $account = Account::find($category->account_id);

            if ($account && $account->name !== $accountName) {
                $account->update([
                    'name' => $accountName,
                ]);
            }

            return;
        }

        // 🆕 CREATE MODE: create or attach account
        $account = Account::firstOrCreate(
            [
                'user_id' => $category->user_id,
                'type'    => $type,
                'name'    => $accountName,
            ],
            [
                'code' => self::generateAccountCode($type, $category->user_id),
            ]
        );

        if ($category->account_id !== $account->id) {
            $category->update([
                'account_id' => $account->id,
            ]);
        }
    }


    protected static function mapCategoryTypeToAccountType(string $type): string
    {
        return match ($type) {
            '1' => 'asset',
            '2' => 'expense',
            '3' => 'revenue',
            default => throw new Exception('Invalid category type')
        };
    }

    protected static function generateAccountCode(string $type, int $userId): string
    {
        return match ($type) {
            'asset' => '101-' . str_pad(Account::where('user_id', $userId)->where('type', 'asset')->count() + 1, 3, '0', STR_PAD_LEFT),
            'expense' => '501-' . str_pad(Account::where('user_id', $userId)->where('type', 'expense')->count() + 1, 3, '0', STR_PAD_LEFT),
            'revenue' => '401-' . str_pad(Account::where('user_id', $userId)->where('type', 'revenue')->count() + 1, 3, '0', STR_PAD_LEFT),
        };
    }
}
