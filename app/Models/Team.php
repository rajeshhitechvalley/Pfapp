<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_leader_id',
        'team_name',
        'member_count',
        'team_value',
        'total_investments',
        'status',
        'activated_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'team_value' => 'decimal:2',
            'total_investments' => 'decimal:2',
            'activated_at' => 'datetime',
        ];
    }

    public function teamLeader()
    {
        return $this->belongsTo(User::class, 'team_leader_id');
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function members()
    {
        return $this->hasManyThrough(User::class, TeamMember::class, 'team_id', 'id', 'id', 'user_id');
    }
}
