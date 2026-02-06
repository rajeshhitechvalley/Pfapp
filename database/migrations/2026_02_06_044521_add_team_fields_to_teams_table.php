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
        Schema::table('teams', function (Blueprint $table) {
            // Only add columns if they don't exist
            if (!Schema::hasColumn('teams', 'team_id')) {
                $table->string('team_id')->unique()->after('id');
            }
            if (!Schema::hasColumn('teams', 'referral_link')) {
                $table->text('referral_link')->nullable()->after('notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            if (Schema::hasColumn('teams', 'referral_link')) {
                $table->dropColumn('referral_link');
            }
            if (Schema::hasColumn('teams', 'team_id')) {
                $table->dropColumn('team_id');
            }
        });
    }
};
