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
        'occupation',
        'bank_name',
        'bank_account_number',
        'bank_ifsc',
        'photo',
        'team_id',
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

    // Team Management Methods
    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    public function teamMembership()
    {
        return $this->hasOne(TeamMember::class, 'user_id');
    }

    public function referralsMade()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralsReceived()
    {
        return $this->hasMany(Referral::class, 'referee_id');
    }

    public function canCreateTeam(): bool
    {
        return $this->ledTeam === null && $this->status === 'active';
    }

    public function canBeActivated(): bool
    {
        return $this->registration_fee_paid >= 500 && $this->registration_approved;
    }

    public function getTeamRole(): string
    {
        if ($this->ledTeam) {
            return 'Team Leader';
        } elseif ($this->team) {
            return 'Team Member';
        }
        return 'No Team';
    }

    public function getReferralStats(): array
    {
        return [
            'total_referrals' => $this->referralsMade()->count(),
            'completed_referrals' => $this->referralsMade()->completed()->count(),
            'pending_referrals' => $this->referralsMade()->pending()->count(),
            'total_commission' => $this->referralsMade()->sum('commission_amount'),
            'paid_commission' => $this->referralsMade()->paid()->sum('commission_amount'),
        ];
    }

    public function activate()
    {
        $this->update([
            'status' => 'active',
            'registration_approved' => true,
        ]);
    }

    public function deactivate()
    {
        $this->update([
            'status' => 'inactive',
        ]);
    }

    public function getFormattedRegistrationFee(): string
    {
        return '₹' . number_format($this->registration_fee_paid, 2);
    }

    public function getRoleDisplayName(): string
    {
        return match($this->role) {
            'admin' => 'Administrator',
            'team_leader' => 'Team Leader',
            'investor' => 'Investor',
            default => 'User',
        };
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'active' => 'green',
            'inactive' => 'yellow',
            'suspended' => 'red',
            default => 'gray',
        };
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
