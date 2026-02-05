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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['land', 'resort', 'hotel', 'farmhouse']);
            $table->text('description');
            $table->decimal('total_area', 15, 2);
            $table->string('area_unit')->default('sqft');
            $table->decimal('purchase_cost', 15, 2);
            $table->decimal('development_cost', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2);
            $table->string('location');
            $table->text('address');
            $table->enum('status', ['planning', 'legal_approval', 'development', 'completed', 'sold'])->default('planning');
            $table->boolean('tsp_approved')->default(false);
            $table->date('tsp_approval_date')->nullable();
            $table->boolean('government_approved')->default(false);
            $table->date('government_approval_date')->nullable();
            $table->integer('total_plots')->default(0);
            $table->integer('available_plots')->default(0);
            $table->integer('sold_plots')->default(0);
            $table->decimal('min_plot_price', 15, 2)->default(0);
            $table->decimal('max_plot_price', 15, 2)->default(0);
            $table->date('expected_completion')->nullable();
            $table->date('actual_completion')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
