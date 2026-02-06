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
        Schema::table('transactions', function (Blueprint $table) {
            // Add ip_address column if it doesn't exist
            if (!Schema::hasColumn('transactions', 'ip_address')) {
                $table->string('ip_address')->nullable()->after('transaction_id');
            }
            
            // Add user_agent column if it doesn't exist
            if (!Schema::hasColumn('transactions', 'user_agent')) {
                $table->text('user_agent')->nullable()->after('ip_address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Remove user_agent column if it exists
            if (Schema::hasColumn('transactions', 'user_agent')) {
                $table->dropColumn('user_agent');
            }
            
            // Remove ip_address column if it exists
            if (Schema::hasColumn('transactions', 'ip_address')) {
                $table->dropColumn('ip_address');
            }
        });
    }
};
