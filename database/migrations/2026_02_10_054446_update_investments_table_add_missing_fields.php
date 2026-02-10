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
        Schema::table('investments', function (Blueprint $table) {
            // First, make existing property_project_id values nullable to avoid constraint issues
            if (Schema::hasColumn('investments', 'property_id') && !Schema::hasColumn('investments', 'property_project_id')) {
                $table->dropForeign(['property_id']);
                $table->renameColumn('property_id', 'property_project_id');
                $table->foreign('property_project_id')->nullable()->references('id')->on('property_projects');
            }
            
            // Add missing fields from model
            $table->decimal('expected_return', 15, 2)->nullable();
            $table->decimal('actual_return', 15, 2)->nullable();
            $table->decimal('return_rate', 8, 4)->nullable();
            $table->date('maturity_date')->nullable();
            $table->integer('reinvestment_count')->default(0);
            $table->foreignId('source_investment_id')->nullable()->references('id')->on('investments');
            $table->boolean('auto_reinvest')->default(false);
            $table->integer('reinvest_percentage')->default(100);
            $table->boolean('modification_requested')->default(false);
            $table->json('modification_details')->nullable();
            $table->timestamp('modification_requested_at')->nullable();
            $table->foreignId('modification_approved_by')->nullable()->references('id')->on('users');
            $table->timestamp('modification_approved_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->references('id')->on('users');
            $table->timestamp('cancelled_at')->nullable();
            $table->string('investment_id')->unique()->nullable();
            $table->json('project_allocation')->nullable();
            $table->json('plot_allocation')->nullable();
            $table->boolean('is_split_investment')->default(false);
            $table->foreignId('parent_investment_id')->nullable()->references('id')->on('investments');
            $table->string('investment_tier')->nullable();
            $table->json('special_terms')->nullable();
            $table->string('risk_level')->nullable();
            $table->date('expected_liquidity_date')->nullable();
            $table->date('actual_liquidation_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investments', function (Blueprint $table) {
            // Drop added columns
            $table->dropColumn([
                'expected_return',
                'actual_return', 
                'return_rate',
                'maturity_date',
                'reinvestment_count',
                'source_investment_id',
                'auto_reinvest',
                'reinvest_percentage',
                'modification_requested',
                'modification_details',
                'modification_requested_at',
                'modification_approved_by',
                'modification_approved_at',
                'cancellation_reason',
                'cancelled_by',
                'cancelled_at',
                'investment_id',
                'project_allocation',
                'plot_allocation',
                'is_split_investment',
                'parent_investment_id',
                'investment_tier',
                'special_terms',
                'risk_level',
                'expected_liquidity_date',
                'actual_liquidation_date'
            ]);
            
            // Revert foreign key and column name
            $table->dropForeign(['property_project_id']);
            $table->renameColumn('property_project_id', 'property_id');
            $table->foreign('property_id')->references('id')->on('properties');
        });
    }
};
