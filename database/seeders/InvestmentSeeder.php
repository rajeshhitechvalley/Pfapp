<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PropertyProject;
use App\Models\Plot;
use App\Models\Investment;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class InvestmentSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample property projects
        $projects = [
            [
                'name' => 'Green Valley Estates',
                'description' => 'Premium residential plots with modern amenities',
                'type' => 'residential',
                'location' => 'Bangalore',
                'total_plots' => 100,
                'available_plots' => 45,
                'sold_plots' => 55,
                'price_per_plot' => 500000,
                'total_value' => 50000000,
                'expected_roi' => 12.5,
                'status' => 'active',
                'approval_status' => 'approved',
            ],
            [
                'name' => 'Sunshine Gardens',
                'description' => 'Affordable housing plots for first-time buyers',
                'type' => 'residential',
                'location' => 'Hyderabad',
                'total_plots' => 80,
                'available_plots' => 30,
                'sold_plots' => 50,
                'price_per_plot' => 350000,
                'total_value' => 28000000,
                'expected_roi' => 10.0,
                'status' => 'active',
                'approval_status' => 'approved',
            ],
        ];

        foreach ($projects as $projectData) {
            PropertyProject::create($projectData);
        }

        // Create sample plots
        $projects = PropertyProject::all();
        
        foreach ($projects as $project) {
            for ($i = 1; $i <= 10; $i++) {
                Plot::create([
                    'property_id' => $project->id,
                    'plot_number' => $project->name . '-P' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'area' => rand(200, 500),
                    'area_unit' => 'sq.yds',
                    'price' => $project->price_per_plot * rand(80, 120) / 100,
                    'price_per_sqft' => $project->price_per_plot / 400,
                    'plot_type' => 'residential',
                    'status' => 'available',
                    'description' => 'Premium residential plot in ' . $project->name,
                    'location_details' => 'Located in ' . $project->location,
                    'facing_direction' => ['N', 'S', 'E', 'W'][array_rand(['N', 'S', 'E', 'W'])],
                    'corner_plot' => rand(0, 1) == 1,
                    'road_width' => rand(20, 40),
                ]);
            }
        }

        // Ensure users have wallets
        $users = User::where('status', 'active')->get();
        
        foreach ($users as $user) {
            if (!$user->wallet) {
                Wallet::create([
                    'user_id' => $user->id,
                    'balance' => rand(10000, 100000),
                    'total_deposits' => rand(10000, 100000),
                    'total_investments' => 0,
                    'total_profits' => 0,
                ]);
            }
        }
    }
}
