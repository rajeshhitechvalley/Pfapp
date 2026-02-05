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
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_leader_id')->constrained('users');
            $table->string('team_name');
            $table->integer('member_count')->default(0);
            $table->decimal('team_value', 15, 2)->default(0);
            $table->decimal('total_investments', 15, 2)->default(0);
            $table->enum('status', ['pending', 'active', 'inactive'])->default('pending');
            $table->timestamp('activated_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->enum('status', ['invited', 'joined', 'left'])->default('invited');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->decimal('investment_amount', 15, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['team_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('teams');
    }
};
