<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'status',
        'kyc_verified',
        'registration_fee_paid',
        'registration_approved',
        'referred_by',
        'referral_code',
        'address',
        'date_of_birth',
        'pan_number',
        'aadhar_number',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'kyc_verified' => 'boolean',
            'registration_approved' => 'boolean',
            'registration_fee_paid' => 'decimal:2',
            'date_of_birth' => 'date',
        ];
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function ledTeam()
    {
        return $this->hasOne(Team::class, 'team_leader_id');
    }

    public function teamMemberships()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function plotHoldings()
    {
        return $this->hasMany(PlotHolding::class);
    }

    public function profits()
    {
        return $this->hasMany(Profit::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'initiated_by');
    }

    public function referredUsers()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function kycDocuments()
    {
        return $this->hasMany(KycDocument::class);
    }

    public function approvedKycDocuments()
    {
        return $this->kycDocuments()->where('status', 'approved');
    }

    public function pendingKycDocuments()
    {
        return $this->kycDocuments()->where('status', 'pending');
    }

    public function isKycComplete(): bool
    {
        $requiredDocuments = ['pan_card', 'aadhar_card', 'address_proof'];
        $approvedDocuments = $this->approvedKycDocuments()
            ->whereIn('document_type', $requiredDocuments)
            ->pluck('document_type')
            ->toArray();

        return count(array_intersect($requiredDocuments, $approvedDocuments)) === count($requiredDocuments);
    }

    public function canBeActivated(): bool
    {
        return $this->registration_fee_paid >= 500 && 
               $this->ledTeam && 
               $this->ledTeam->member_count >= 20 &&
               $this->isKycComplete();
    }

    public function getRoleDisplayName(): string
    {
        return match($this->role) {
            'investor' => 'Investor',
            'team_leader' => 'Team Leader',
            'admin' => 'Administrator',
            default => ucfirst($this->role)
        };
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'active' => 'green',
            'inactive' => 'red',
            default => 'gray'
        };
    }
}
