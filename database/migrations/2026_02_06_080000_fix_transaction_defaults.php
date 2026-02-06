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
            // Ensure reference column exists and has proper default value
            if (Schema::hasColumn('transactions', 'reference')) {
                $table->string('reference')->nullable()->default(null)->change();
            } else if (Schema::hasColumn('transactions', 'reference_id')) {
                // Rename reference_id to reference if it exists
                $table->renameColumn('reference_id', 'reference');
                $table->string('reference')->nullable()->default(null)->change();
            } else {
                // Add reference column if it doesn't exist
                $table->string('reference')->nullable()->default(null)->after('description');
            }
            
            // Also ensure other required fields have defaults
            if (Schema::hasColumn('transactions', 'balance_before')) {
                $table->decimal('balance_before', 15, 2)->default(0)->change();
            }
            
            if (Schema::hasColumn('transactions', 'balance_after')) {
                $table->decimal('balance_after', 15, 2)->default(0)->change();
            }
            
            if (Schema::hasColumn('transactions', 'processing_fee')) {
                $table->decimal('processing_fee', 15, 2)->default(0)->change();
            }
            
            if (Schema::hasColumn('transactions', 'net_amount')) {
                $table->decimal('net_amount', 15, 2)->default(0)->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // We won't remove columns in down() to avoid data loss
        });
    }
};
