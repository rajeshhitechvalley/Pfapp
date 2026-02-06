<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('wallets', 'frozen_amount')) {
                $table->decimal('frozen_amount', 15, 2)->default(0)->after('balance');
            }
            
            if (!Schema::hasColumn('wallets', 'pending_amount')) {
                $table->decimal('pending_amount', 15, 2)->default(0)->after('frozen_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            // Remove columns if they exist
            if (Schema::hasColumn('wallets', 'frozen_amount')) {
                $table->dropColumn('frozen_amount');
            }
            
            if (Schema::hasColumn('wallets', 'pending_amount')) {
                $table->dropColumn('pending_amount');
            }
        });
    }
};
