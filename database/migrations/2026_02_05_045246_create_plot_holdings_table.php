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
        Schema::create('plot_holdings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('plot_id')->constrained();
            $table->foreignId('investment_id')->constrained();
            $table->enum('status', ['active', 'expired', 'transferred', 'sold'])->default('active');
            $table->date('hold_start_date');
            $table->date('hold_expiry_date');
            $table->integer('lock_period_days')->default(90);
            $table->boolean('transfer_allowed')->default(false);
            $table->decimal('hold_value', 15, 2);
            $table->decimal('team_value_required', 15, 2);
            $table->decimal('investment_required', 15, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'plot_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plot_holdings');
    }
};
