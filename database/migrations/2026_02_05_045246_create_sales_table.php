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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plot_id')->constrained();
            $table->foreignId('property_id')->constrained();
            $table->string('buyer_name');
            $table->string('buyer_phone');
            $table->string('buyer_email')->nullable();
            $table->text('buyer_address');
            $table->decimal('sale_price', 15, 2);
            $table->decimal('original_price', 15, 2);
            $table->decimal('profit_amount', 15, 2);
            $table->decimal('company_percentage', 5, 2)->default(20);
            $table->decimal('company_profit', 15, 2);
            $table->decimal('investor_profit', 15, 2);
            $table->enum('status', ['initiated', 'confirmed', 'documentation', 'handover', 'completed'])->default('initiated');
            $table->date('sale_date');
            $table->date('confirmation_date')->nullable();
            $table->date('handover_date')->nullable();
            $table->foreignId('initiated_by')->constrained('users');
            $table->text('sale_agreement')->nullable();
            $table->text('documents')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
