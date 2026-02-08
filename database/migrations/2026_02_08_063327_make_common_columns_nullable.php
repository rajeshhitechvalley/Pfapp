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
            // Make commonly null columns nullable to prevent constraint violations
            $table->string('length')->nullable()->change();
            $table->string('width')->nullable()->change();
            $table->string('facing_direction')->nullable()->change();
            $table->string('location_coordinates')->nullable()->change();
            $table->string('nearby_amenities')->nullable()->change();
            $table->string('soil_type')->nullable()->change();
            $table->string('topography')->nullable()->change();
            $table->string('legal_clearance')->nullable()->change();
            $table->string('road_access')->nullable()->change();
            $table->json('tags')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plots', function (Blueprint $table) {
            $table->string('length')->nullable(false)->change();
            $table->string('width')->nullable(false)->change();
            $table->string('facing_direction')->nullable(false)->change();
            $table->string('location_coordinates')->nullable(false)->change();
            $table->string('nearby_amenities')->nullable(false)->change();
            $table->string('soil_type')->nullable(false)->change();
            $table->string('topography')->nullable(false)->change();
            $table->string('legal_clearance')->nullable(false)->change();
            $table->string('road_access')->nullable(false)->change();
            $table->json('tags')->nullable(false)->change();
        });
    }
};
