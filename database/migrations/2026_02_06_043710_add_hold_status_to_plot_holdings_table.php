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
        Schema::table('plot_holdings', function (Blueprint $table) {
            $table->enum('hold_status', ['active', 'expired', 'released', 'cancelled'])->default('active')->after('status');
            $table->index('hold_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plot_holdings', function (Blueprint $table) {
            $table->dropIndex(['hold_status']);
            $table->dropColumn('hold_status');
        });
    }
};
