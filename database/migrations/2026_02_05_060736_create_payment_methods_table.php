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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('code', 20)->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['deposit', 'withdrawal', 'both']);
            $table->boolean('is_active')->default(true);
            $table->decimal('min_amount', 10, 2)->default(0);
            $table->decimal('max_amount', 10, 2)->nullable();
            $table->decimal('processing_fee', 5, 2)->default(0);
            $table->enum('processing_fee_type', ['fixed', 'percentage'])->default('fixed');
            $table->json('settings')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['code', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
