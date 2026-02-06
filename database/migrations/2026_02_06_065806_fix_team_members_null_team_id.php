<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, delete any team_members records with null team_id or user_id
        DB::table('team_members')
            ->whereNull('team_id')
            ->orWhereNull('user_id')
            ->delete();
            
        // Also clean up any orphaned records where the team or user doesn't exist
        DB::table('team_members')
            ->whereNotIn('team_id', function($query) {
                $query->select('id')->from('teams');
            })
            ->orWhereNotIn('user_id', function($query) {
                $query->select('id')->from('users');
            })
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this cleanup migration
    }
};
