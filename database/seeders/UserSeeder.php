<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Team;
use App\Models\Wallet;
use App\Models\Investment;
use App\Models\Property;
use App\Models\Plot;
use App\Models\Transaction;
use App\Models\Sale;
use App\Models\Profit;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic test users.
     */
    public function run(): void
    {
        // Create admin user (only if doesn't exist)
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@pfapp.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'kyc_verified' => true,
                'referral_code' => 'ADMIN123',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Create admin wallet (only if doesn't exist)
        Wallet::firstOrCreate(
            ['user_id' => $adminUser->id],
            [
                'balance' => 1000000, // ₹10,00,000
                'total_deposits' => 0,
                'total_withdrawals' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Create test investors
        $investors = [
            [
                'name' => 'John Investor',
                'email' => 'john.investor@example.com',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'kyc_verified' => true,
                'referral_code' => 'JOHN123',
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(15),
            ],
            [
                'name' => 'Sarah Investor',
                'email' => 'sarah.investor@example.com',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'kyc_verified' => true,
                'referral_code' => 'SARAH123',
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(10),
            ],
            [
                'name' => 'Michael Investor',
                'email' => 'michael.investor@example.com',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'kyc_verified' => true,
                'referral_code' => 'MICHAEL123',
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(5),
            ],
            [
                'name' => 'Emma Investor',
                'email' => 'emma.investor@example.com',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'kyc_verified' => true,
                'referral_code' => 'EMMA123',
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(8),
            ],
            [
                'name' => 'David Investor',
                'email' => 'david.investor@example.com',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'kyc_verified' => true,
                'referral_code' => 'DAVID123',
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(3),
            ],
        ];

        // Create users and their wallets
        foreach ($investors as $investor) {
            $user = User::firstOrCreate(
                ['email' => $investor['email']],
                [
                    'name' => $investor['name'],
                    'password' => $investor['password'],
                    'status' => $investor['status'],
                    'kyc_verified' => $investor['kyc_verified'],
                    'referral_code' => $investor['referral_code'],
                    'created_at' => $investor['created_at'],
                    'updated_at' => $investor['updated_at'],
                ]
            );

            // Create wallet for each user (only if doesn't exist)
            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'balance' => rand(50000, 500000), // Random balance between ₹50,000 - ₹5,00,000
                    'total_deposits' => rand(50000, 500000),
                    'total_withdrawals' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Create some sample investments for each user
            $this->createSampleInvestments($user);

            // Create sample teams
            $this->createSampleTeams($user, $investors);
        }

        // Success message
        echo "✅ UserSeeder completed successfully!\n";
        echo "👥 Created 1 admin user and 5 investor users with wallets, investments, and teams\n";
    }

    /**
     * Create sample investments for a user.
     */
    private function createSampleInvestments(User $user): void
    {
        // Create sample properties manually instead of using factory
        $properties = [];
        for ($i = 0; $i < 3; $i++) {
            $property = Property::create([
                'name' => 'Sample Property ' . ($i + 1),
                'type' => 'land',
                'description' => 'Sample property for testing investments',
                'location' => 'Sample Location ' . ($i + 1),
                'address' => 'Sample Address ' . ($i + 1),
                'total_area' => 10000,
                'area_unit' => 'sqft',
                'purchase_cost' => 5000000,
                'development_cost' => 5000000,
                'total_cost' => 10000000,
                'total_plots' => 100,
                'available_plots' => 50,
                'sold_plots' => 0,
                'status' => 'completed',
                'tsp_approved' => true,
                'tsp_approval_date' => now()->subDays(30),
                'government_approved' => true,
                'government_approval_date' => now()->subDays(25),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 15)),
            ]);
            $properties[] = $property;
        }
        
        for ($i = 0; $i < 3; $i++) {
            Investment::create([
                'user_id' => $user->id,
                'property_id' => $properties[$i]->id,
                'plot_id' => null,
                'amount' => rand(100000, 500000),
                'investment_type' => ['general', 'project_specific', 'plot_specific'][array_rand(['general', 'project_specific', 'plot_specific'])],
                'status' => 'approved',
                'investment_date' => now()->subDays(rand(1, 30)),
                'approval_date' => now()->subDays(rand(1, 15)),
                'returns_generated' => 0,
                'profit_distributed' => 0,
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 15)),
            ]);
        }
    }

    /**
     * Create sample teams for users.
     */
    private function createSampleTeams(User $user, array $allUsers): void
    {
        // Create a simple team with the current user as leader
        $team = Team::create([
            'team_name' => 'Investment Team ' . $user->name,
            'team_leader_id' => $user->id,
            'member_count' => 1,
            'team_value' => rand(1000000, 5000000),
            'total_investments' => rand(500000, 2000000),
            'status' => 'active',
            'activated_at' => now()->subDays(rand(1, 30)),
            'created_at' => now()->subDays(rand(10, 60)),
            'updated_at' => now()->subDays(rand(5, 30)),
        ]);

        // Add the current user as a team member
        DB::table('team_members')->insert([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'status' => 'joined',
            'joined_at' => now()->subDays(rand(1, 20)),
            'investment_amount' => rand(100000, 500000),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
