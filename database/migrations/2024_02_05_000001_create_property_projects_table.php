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
        Schema::create('property_projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['land', 'resort', 'hotel', 'farmhouse', 'commercial', 'residential'])->default('land');
            $table->string('location');
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('pincode')->nullable();
            $table->decimal('total_area', 10, 2)->nullable();
            $table->integer('total_plots')->default(0);
            $table->integer('available_plots')->default(0);
            $table->integer('sold_plots')->default(0);
            $table->decimal('price_per_plot', 12, 2)->nullable();
            $table->decimal('total_value', 15, 2)->nullable();
            $table->decimal('development_cost', 15, 2)->default(0);
            $table->decimal('legal_cost', 15, 2)->default(0);
            $table->decimal('marketing_cost', 15, 2)->default(0);
            $table->decimal('infrastructure_cost', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->decimal('expected_roi', 5, 2)->nullable();
            $table->date('projected_completion_date')->nullable();
            $table->date('actual_completion_date')->nullable();
            $table->enum('status', ['pending', 'active', 'completed', 'cancelled', 'on_hold'])->default('pending');
            $table->enum('approval_status', ['pending', 'approved', 'rejected', 'under_review'])->default('pending');
            $table->enum('legal_approval_status', ['pending', 'approved', 'rejected', 'not_required'])->default('pending');
            $table->enum('government_approval_status', ['pending', 'approved', 'rejected', 'not_required'])->default('pending');
            $table->enum('tsp_approval_status', ['pending', 'approved', 'rejected', 'not_required'])->default('pending');
            $table->foreignId('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->foreignId('updated_by')->nullable();
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index(['city', 'state']);
            $table->index(['approval_status']);
            $table->index(['legal_approval_status', 'government_approval_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_projects');
    }
};
