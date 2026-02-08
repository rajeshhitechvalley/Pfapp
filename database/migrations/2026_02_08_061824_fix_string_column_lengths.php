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
            // Fix string column lengths to prevent truncation
            $table->string('plot_number', 50)->change();
            $table->string('description', 2000)->change();
            $table->string('dimensions', 100)->change();
            $table->string('location_details', 1000)->change();
            $table->string('facing_direction', 10)->change();
            $table->string('location_coordinates', 255)->change();
            $table->string('nearby_amenities', 1000)->change();
            $table->string('soil_type', 100)->change();
            $table->string('topography', 100)->change();
            $table->string('legal_clearance', 100)->change();
            $table->string('road_access', 100)->change();
            $table->string('tags', 500)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plots', function (Blueprint $table) {
            // Revert to default lengths (this will restore original constraints)
            $table->string('plot_number', 255)->change();
            $table->string('description', 255)->change();
            $table->string('dimensions', 255)->change();
            $table->string('location_details', 255)->change();
            $table->string('facing_direction', 255)->change();
            $table->string('location_coordinates', 255)->change();
            $table->string('nearby_amenities', 255)->change();
            $table->string('soil_type', 255)->change();
            $table->string('topography', 255)->change();
            $table->string('legal_clearance', 255)->change();
            $table->string('road_access', 255)->change();
            $table->string('tags', 255)->change();
        });
    }
};
