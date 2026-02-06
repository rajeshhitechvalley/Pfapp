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
            // Add payment_method_id column if it doesn't exist
            if (!Schema::hasColumn('transactions', 'payment_method_id')) {
                $table->unsignedBigInteger('payment_method_id')->nullable()->after('description');
                
                // Add foreign key constraint if payment_methods table exists
                if (Schema::hasTable('payment_methods')) {
                    $table->foreign('payment_method_id')
                          ->references('id')
                          ->on('payment_methods')
                          ->onDelete('set null');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop foreign key constraint if it exists
            if (Schema::hasTable('payment_methods')) {
                $table->dropForeign(['payment_method_id']);
            }
            
            // Remove payment_method_id column if it exists
            if (Schema::hasColumn('transactions', 'payment_method_id')) {
                $table->dropColumn('payment_method_id');
            }
        });
    }
};
