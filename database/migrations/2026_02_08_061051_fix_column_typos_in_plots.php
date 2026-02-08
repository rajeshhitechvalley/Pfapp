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
            $table->string('electricity_connection')->nullable()->after('water_connection');
            $table->string('sewage_connection')->nullable()->after('electricity_connection');
            $table->string('nearby_amenities')->nullable()->after('location_coordinates');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plots', function (Blueprint $table) {
            $table->dropColumn(['electricity_connection', 'sewage_connection', 'nearby_amenities']);
        });
    }
};
