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
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('property_id')->nullable()->constrained();
            $table->foreignId('plot_id')->nullable()->constrained();
            $table->decimal('amount', 15, 2);
            $table->enum('investment_type', ['general', 'project_specific', 'plot_specific']);
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->date('investment_date');
            $table->date('approval_date')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->text('notes')->nullable();
            $table->decimal('returns_generated', 15, 2)->default(0);
            $table->decimal('profit_distributed', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};
