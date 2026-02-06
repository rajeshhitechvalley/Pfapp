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
            // Add transaction_id column if it doesn't exist
            if (!Schema::hasColumn('transactions', 'transaction_id')) {
                $table->string('transaction_id')->unique()->after('payment_method_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Remove transaction_id column if it exists
            if (Schema::hasColumn('transactions', 'transaction_id')) {
                $table->dropColumn('transaction_id');
            }
        });
    }
};
