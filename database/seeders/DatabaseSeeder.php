<?php

namespace Database\Seeders;

use App\Enums\CategoryTypeConstant;
use App\Models\Category;
use App\Models\User;
use DateTime;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use function Symfony\Component\Clock\now;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $user = User::factory()->create([
            'email' => 'admin@mailinator.com',
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        // User::firstOrCreate(
        //     ['email' => 'admin@mailiator.com'],
        //     [
        //         'email' => 'admin@mailiator.com',
        //         'email_verified_at' => now(),
        //     ]
        // );

        Category::insert([
            'user_id' => $user->id,
            'name' => 'Makanan',
            'type' => CategoryTypeConstant::TRANSACTION->value,
            'updated_at' => now(),
            'created_at' => now(),
        ]);
        Category::insert([
            'user_id' => $user->id,
            'name' => 'Bank',
            'type' => CategoryTypeConstant::WALLET->value,
            'updated_at' => now(),
            'created_at' => now(),
        ]);
    }
}
