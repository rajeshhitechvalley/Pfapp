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
        Schema::create('plots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained();
            $table->string('plot_number');
            $table->decimal('area', 15, 2);
            $table->string('area_unit')->default('sqft');
            $table->decimal('price', 15, 2);
            $table->decimal('price_per_sqft', 10, 2);
            $table->enum('plot_type', ['corner', 'middle', 'double_road', 'single_road']);
            $table->boolean('road_facing')->default(false);
            $table->enum('status', ['available', 'held', 'sold', 'reserved'])->default('available');
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->string('dimensions')->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->text('location_details')->nullable();
            $table->timestamps();
            
            $table->unique(['property_id', 'plot_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plots');
    }
};
