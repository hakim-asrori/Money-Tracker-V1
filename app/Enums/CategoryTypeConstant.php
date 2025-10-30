<?php

namespace App\Enums;

enum CategoryTypeConstant: int
{
    case WALLET = 1;
    case TRANSACTION = 2;
    case INCOME = 3;

    public static function toArray(): array
    {
        return array_map(fn($case) => [
            'key' => $case->value,
            'value' => $case->getMessage($case->value),
        ], self::cases());
    }

    public static function getMessage(int $key): string
    {
        switch (self::from($key)) {
            case self::WALLET:
                return 'Wallet';
            case self::TRANSACTION:
                return 'Transaction';
            case self::INCOME:
                return 'Income';
            default:
                return 'Unknown category';
        }
    }
}
