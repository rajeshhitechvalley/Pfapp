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
            // Add balance_before column if it doesn't exist and set default value
            if (Schema::hasColumn('transactions', 'balance_before')) {
                $table->decimal('balance_before', 15, 2)->default(0)->change();
            }
            
            // Add balance_after column if it doesn't exist and set default value
            if (Schema::hasColumn('transactions', 'balance_after')) {
                $table->decimal('balance_after', 15, 2)->default(0)->change();
            }
            
            // Add other missing columns if they don't exist
            if (!Schema::hasColumn('transactions', 'balance_before')) {
                $table->decimal('balance_before', 15, 2)->default(0)->after('amount');
            }
            
            if (!Schema::hasColumn('transactions', 'balance_after')) {
                $table->decimal('balance_after', 15, 2)->default(0)->after('balance_before');
            }
            
            // Add processing_fee column if it doesn't exist
            if (!Schema::hasColumn('transactions', 'processing_fee')) {
                $table->decimal('processing_fee', 15, 2)->default(0)->after('amount');
            }
            
            // Add net_amount column if it doesn't exist
            if (!Schema::hasColumn('transactions', 'net_amount')) {
                $table->decimal('net_amount', 15, 2)->default(0)->after('processing_fee');
            }
            
            // Add reference column if it doesn't exist (rename from reference_id)
            if (!Schema::hasColumn('transactions', 'reference') && Schema::hasColumn('transactions', 'reference_id')) {
                $table->renameColumn('reference_id', 'reference');
            }
            
            if (!Schema::hasColumn('transactions', 'reference') && !Schema::hasColumn('transactions', 'reference_id')) {
                $table->string('reference')->nullable()->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Note: We won't remove columns in down() as it could cause data loss
            // The columns should be kept even if they're not used
        });
    }
};
