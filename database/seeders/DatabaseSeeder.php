<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        User::factory()->create([
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
    }
}
