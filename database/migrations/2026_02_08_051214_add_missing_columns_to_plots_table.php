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
            // Missing columns from the form
            $table->string('facing_direction')->nullable();
            $table->decimal('road_width', 8, 2)->nullable();
            $table->boolean('corner_plot')->default(false);
            $table->boolean('double_road')->default(false);
            $table->string('location_coordinates')->nullable();
            $table->json('nearby_amenities')->nullable();
            $table->string('soil_type')->nullable();
            $table->string('topography')->nullable();
            $table->string('legal_clearance')->nullable();
            $table->decimal('development_charges', 10, 2)->nullable();
            $table->decimal('maintenance_charges', 10, 2)->nullable();
            $table->boolean('water_connection')->default(false);
            $table->boolean('electricity_connection')->default(false);
            $table->boolean('sewage_connection')->default(false);
            $table->boolean('gas_connection')->default(false);
            $table->boolean('internet_connection')->default(false);
            $table->string('road_access')->nullable();
            $table->json('tags')->nullable();
            $table->unsignedTinyInteger('priority_level')->nullable();
            $table->boolean('featured_plot')->default(false);
            $table->decimal('original_price', 12, 2)->nullable();
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->boolean('special_offer')->default(false);
            $table->date('offer_expiry_date')->nullable();
            $table->boolean('negotiable')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plots', function (Blueprint $table) {
            $table->dropColumn([
                'facing_direction',
                'road_width',
                'corner_plot',
                'double_road',
                'location_coordinates',
                'nearby_amenities',
                'soil_type',
                'topography',
                'legal_clearance',
                'development_charges',
                'maintenance_charges',
                'water_connection',
                'electricity_connection',
                'sewage_connection',
                'gas_connection',
                'internet_connection',
                'road_access',
                'tags',
                'priority_level',
                'featured_plot',
                'original_price',
                'discount_percentage',
                'special_offer',
                'offer_expiry_date',
                'negotiable'
            ]);
        });
    }
};
