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
            // Add any missing columns that the form is trying to submit
            // Based on the SQL error, these columns might be missing:
            if (!Schema::hasColumn('plots', 'dimensions')) {
                $table->string('dimensions')->nullable();
            }
            if (!Schema::hasColumn('plots', 'length')) {
                $table->decimal('length', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('plots', 'width')) {
                $table->decimal('width', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('plots', 'facing_direction')) {
                $table->string('facing_direction')->nullable();
            }
            if (!Schema::hasColumn('plots', 'road_width')) {
                $table->decimal('road_width', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('plots', 'corner_plot')) {
                $table->boolean('corner_plot')->default(false);
            }
            if (!Schema::hasColumn('plots', 'double_road')) {
                $table->boolean('double_road')->default(false);
            }
            if (!Schema::hasColumn('plots', 'location_coordinates')) {
                $table->string('location_coordinates')->nullable();
            }
            if (!Schema::hasColumn('plots', 'nearby_amenities')) {
                $table->json('nearby_amenities')->nullable();
            }
            if (!Schema::hasColumn('plots', 'soil_type')) {
                $table->string('soil_type')->nullable();
            }
            if (!Schema::hasColumn('plots', 'topography')) {
                $table->string('topography')->nullable();
            }
            if (!Schema::hasColumn('plots', 'legal_clearance')) {
                $table->string('legal_clearance')->nullable();
            }
            if (!Schema::hasColumn('plots', 'development_charges')) {
                $table->decimal('development_charges', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('plots', 'maintenance_charges')) {
                $table->decimal('maintenance_charges', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('plots', 'water_connection')) {
                $table->boolean('water_connection')->default(false);
            }
            if (!Schema::hasColumn('plots', 'electricity_connection')) {
                $table->boolean('electricity_connection')->default(false);
            }
            if (!Schema::hasColumn('plots', 'sewage_connection')) {
                $table->boolean('sewage_connection')->default(false);
            }
            if (!Schema::hasColumn('plots', 'gas_connection')) {
                $table->boolean('gas_connection')->default(false);
            }
            if (!Schema::hasColumn('plots', 'internet_connection')) {
                $table->boolean('internet_connection')->default(false);
            }
            if (!Schema::hasColumn('plots', 'road_access')) {
                $table->string('road_access')->nullable();
            }
            if (!Schema::hasColumn('plots', 'tags')) {
                $table->json('tags')->nullable();
            }
            if (!Schema::hasColumn('plots', 'priority_level')) {
                $table->unsignedTinyInteger('priority_level')->nullable();
            }
            if (!Schema::hasColumn('plots', 'featured_plot')) {
                $table->boolean('featured_plot')->default(false);
            }
            if (!Schema::hasColumn('plots', 'original_price')) {
                $table->decimal('original_price', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('plots', 'discount_percentage')) {
                $table->decimal('discount_percentage', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('plots', 'special_offer')) {
                $table->boolean('special_offer')->default(false);
            }
            if (!Schema::hasColumn('plots', 'offer_expiry_date')) {
                $table->date('offer_expiry_date')->nullable();
            }
            if (!Schema::hasColumn('plots', 'negotiable')) {
                $table->boolean('negotiable')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plots', function (Blueprint $table) {
            $columns = [
                'dimensions', 'length', 'width', 'facing_direction', 'road_width',
                'corner_plot', 'double_road', 'location_coordinates', 'nearby_amenities',
                'soil_type', 'topography', 'legal_clearance', 'development_charges',
                'maintenance_charges', 'water_connection', 'electricity_connection',
                'sewage_connection', 'gas_connection', 'internet_connection',
                'road_access', 'tags', 'priority_level', 'featured_plot',
                'original_price', 'discount_percentage', 'special_offer',
                'offer_expiry_date', 'negotiable'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('plots', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
