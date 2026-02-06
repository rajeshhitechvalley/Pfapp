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
            $table->decimal('hold_amount', 15, 2)->default(0)->after('investment_required');
            $table->index('hold_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plot_holdings', function (Blueprint $table) {
            $table->dropIndex(['hold_amount']);
            $table->dropColumn('hold_amount');
        });
    }
};
