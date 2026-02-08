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
        Schema::table('plots', function (Blueprint $table) {
            // Fix typos in column names
            $table->renameColumn('facing_direction', 'facing_direction');
            $table->renameColumn('nearby_amenities', 'nearby_amenities');
            $table->renameColumn('electricity_connection', 'electricity_connection');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plots', function (Blueprint $table) {
            // Revert typos
            $table->renameColumn('facing_direction', 'facing_direction');
            $table->renameColumn('nearby_amenities', 'nearby_amenities');
            $table->renameColumn('electricity_connection', 'electricity_connection');
        });
    }
};
