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
        Schema::table('plots', function (Blueprint $table) {
            $table->boolean('is_held')->default(false)->after('status');
            $table->foreignId('held_by_user_id')->nullable()->after('is_held');
            $table->datetime('hold_start_date')->nullable()->after('held_by_user_id');
            $table->datetime('hold_expiry_date')->nullable()->after('hold_start_date');
            $table->enum('hold_status', ['active', 'expired', 'released'])->nullable()->after('hold_expiry_date');
            $table->text('hold_notes')->nullable()->after('hold_status');
            
            $table->index('is_held');
            $table->index('held_by_user_id');
            $table->index('hold_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plots', function (Blueprint $table) {
            $table->dropIndex(['is_held']);
            $table->dropIndex(['held_by_user_id']);
            $table->dropIndex(['hold_status']);
            $table->dropColumn([
                'is_held',
                'held_by_user_id', 
                'hold_start_date',
                'hold_expiry_date',
                'hold_status',
                'hold_notes'
            ]);
        });
    }
};
