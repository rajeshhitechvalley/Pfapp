<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;

class TeamUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create a user without a team for testing
        $user = User::create([
            'name' => 'Team Leader User',
            'email' => 'teamlead@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
            'kyc_verified' => true,
            'registration_fee_paid' => 500,
        ]);

        // Create wallet for the user
        Wallet::create([
            'user_id' => $user->id,
            'balance' => 10000,
            'total_deposits' => 10000,
            'total_investments' => 0,
            'total_profits' => 0,
        ]);

        echo "Created team leader user: {$user->email}\n";
    }
}
