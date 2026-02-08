<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'team_leader_id',
        'team_name',
        'description',
        'member_count',
        'team_value',
        'total_investments',
        'status',
        'activated_at',
        'referral_link',
        'notes',
    ];

    protected $with = ['teamLeader', 'teamMembers'];

    protected function casts(): array
    {
        return [
            'team_value' => 'decimal:2',
            'total_investments' => 'decimal:2',
            'activated_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($team) {
            if (empty($team->team_id)) {
                $team->team_id = 'TM' . strtoupper(Str::random(8));
            }
            if (empty($team->referral_link)) {
                $team->referral_link = route('register', ['ref' => $team->team_id]);
            }
        });
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

    public function activeMembers()
    {
        return $this->teamMembers()->where('status', 'joined');
    }

    public function investments()
    {
        return $this->hasManyThrough(Investment::class, TeamMember::class, 'team_id', 'user_id', 'id', 'user_id');
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'team_id');
    }

    public function canBeActivated(): bool
    {
        return $this->member_count >= 20 && $this->status !== 'active';
    }

    public function toArray(): array
    {
        $array = parent::toArray();
        
        // Ensure teamMembers is always included, even if empty
        if (!isset($array['team_members'])) {
            $array['team_members'] = [];
        }
        
        return $array;
    }

    public function getFormattedTeamValue(): string
    {
        $value = $this->team_value ?? 0;
        return '₹' . number_format((float) $value, 2);
    }

    public function getFormattedTotalInvestments(): string
    {
        $value = $this->total_investments ?? 0;
        return '₹' . number_format((float) $value, 2);
    }

    public function getActivationProgress(): array
    {
        return [
            'current' => $this->member_count,
            'required' => 20,
            'percentage' => min(($this->member_count / 20) * 100, 100),
            'can_activate' => $this->canBeActivated(),
        ];
    }

    public function getGrowthData(): array
    {
        $membersByMonth = $this->teamMembers()
            ->selectRaw('DATE_FORMAT(joined_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('joined_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $membersByMonth->map(function ($data) {
            return [
                'month' => $data->month,
                'members' => $data->count,
            ];
        })->toArray();
    }

    public function getTopPerformers(): array
    {
        return $this->members()
            ->withSum('investments', 'amount')
            ->orderByDesc('investments_sum_amount')
            ->limit(5)
            ->get()
            ->map(function ($member) {
                return [
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'total_investments' => $member->investments_sum_amount ?? 0,
                    'investment_count' => $member->investments()->count(),
                ];
            })
            ->toArray();
    }
}
