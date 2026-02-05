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
        Schema::create('profits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('investment_id')->constrained();
            $table->decimal('total_profit', 15, 2);
            $table->decimal('company_percentage', 5, 2)->default(20);
            $table->decimal('company_share', 15, 2);
            $table->decimal('investor_share', 15, 2);
            $table->decimal('user_investment_amount', 15, 2);
            $table->decimal('team_contribution_amount', 15, 2);
            $table->decimal('total_project_investment', 15, 2);
            $table->decimal('profit_percentage', 5, 2);
            $table->enum('status', ['calculated', 'distributed', 'credited'])->default('calculated');
            $table->date('calculation_date');
            $table->date('distribution_date')->nullable();
            $table->date('credit_date')->nullable();
            $table->foreignId('calculated_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profits');
    }
};
