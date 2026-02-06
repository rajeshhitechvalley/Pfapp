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
        Schema::table('payment_methods', function (Blueprint $table) {
            // Add status column if it doesn't exist
            if (!Schema::hasColumn('payment_methods', 'status')) {
                $table->enum('status', ['active', 'inactive', 'disabled'])->default('active')->after('type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_methods', function (Blueprint $table) {
            // Remove status column if it exists
            if (Schema::hasColumn('payment_methods', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
