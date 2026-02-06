<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PaymentMethodSeeder::class,
        ]);
        
        echo "✅ Database seeding completed!\n";
        echo "📊 Created users, payment methods, and sample data\n";
    }
}
