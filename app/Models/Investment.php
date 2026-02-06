<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'property_project_id',
        'plot_id',
        'amount',
        'investment_type',
        'status',
        'investment_date',
        'approval_date',
        'approved_by',
        'notes',
        'returns_generated',
        'profit_distributed',
        'expected_return',
        'actual_return',
        'return_rate',
        'maturity_date',
        'reinvestment_count',
        'source_investment_id', // For reinvestment tracking
        'auto_reinvest', // Auto-reinvest setting
        'reinvest_percentage', // Percentage of returns to auto-reinvest
        'modification_requested', // For investment modification tracking
        'modification_details', // JSON field for modification details
        'modification_requested_at', // When modification was requested
        'modification_approved_by', // Who approved the modification
        'modification_approved_at', // When modification was approved
        'cancellation_reason', // Reason for cancellation
        'cancelled_by', // Who cancelled the investment
        'cancelled_at', // When investment was cancelled
        'investment_id', // Unique investment identifier
        'project_allocation', // JSON field for project-wise allocation
        'plot_allocation', // JSON field for plot-wise allocation
        'is_split_investment', // Flag for split investments across multiple plots
        'parent_investment_id', // For tracking split investments
        'investment_tier', // Investment tier based on amount
        'special_terms', // Any special terms for the investment
        'risk_level', // Risk level assessment
        'expected_liquidity_date', // When investment can be liquidated
        'actual_liquidation_date', // When investment was actually liquidated
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'investment_date' => 'date',
            'approval_date' => 'date',
            'returns_generated' => 'decimal:2',
            'profit_distributed' => 'decimal:2',
            'expected_return' => 'decimal:2',
            'actual_return' => 'decimal:2',
            'return_rate' => 'decimal:4',
            'maturity_date' => 'date',
            'reinvestment_count' => 'integer',
            'auto_reinvest' => 'boolean',
            'reinvest_percentage' => 'integer',
            'modification_requested' => 'boolean',
            'modification_details' => 'array',
            'modification_requested_at' => 'datetime',
            'modification_approved_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'project_allocation' => 'array',
            'plot_allocation' => 'array',
            'is_split_investment' => 'boolean',
            'investment_tier' => 'string',
            'special_terms' => 'array',
            'risk_level' => 'string',
            'expected_liquidity_date' => 'date',
            'actual_liquidation_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(PropertyProject::class, 'property_project_id');
    }

    public function project()
    {
        return $this->belongsTo(PropertyProject::class, 'property_project_id');
    }

    public function plot()
    {
        return $this->belongsTo(Plot::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function modifier()
    {
        return $this->belongsTo(User::class, 'modification_approved_by');
    }

    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function parentInvestment()
    {
        return $this->belongsTo(Investment::class, 'parent_investment_id');
    }

    public function splitInvestments()
    {
        return $this->hasMany(Investment::class, 'parent_investment_id');
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

    public function reinvestments()
    {
        return $this->hasMany(Investment::class, 'source_investment_id');
    }

    public function sourceInvestment()
    {
        return $this->belongsTo(Investment::class, 'source_investment_id');
    }

    // Scopes for filtering
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopePendingApproval($query)
    {
        return $query->where('status', 'pending_approval');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByTeam($query, $teamId)
    {
        return $query->whereHas('user', function ($q) use ($teamId) {
            $q->whereHas('teamMemberships', function ($teamQuery) use ($teamId) {
                $teamQuery->where('team_id', $teamId);
            });
        });
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('property_project_id', $projectId);
    }

    public function scopeByPlot($query, $plotId)
    {
        return $query->where('plot_id', $plotId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('investment_type', $type);
    }

    public function scopeByTier($query, $tier)
    {
        return $query->where('investment_tier', $tier);
    }

    public function scopeByRiskLevel($query, $riskLevel)
    {
        return $query->where('risk_level', $riskLevel);
    }

    public function scopeAutoReinvest($query)
    {
        return $query->where('auto_reinvest', true);
    }

    public function scopeSplitInvestments($query)
    {
        return $query->where('is_split_investment', true);
    }

    public function scopeMatured($query)
    {
        return $query->where('maturity_date', '<=', now());
    }

    public function scopeLiquidatable($query)
    {
        return $query->where('expected_liquidity_date', '<=', now())
                    ->where('status', 'active');
    }

    // Status methods
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isPendingApproval(): bool
    {
        return $this->status === 'pending_approval';
    }

    public function isMatured(): bool
    {
        return $this->maturity_date && $this->maturity_date->isPast();
    }

    public function isLiquidatable(): bool
    {
        return $this->expected_liquidity_date && 
               $this->expected_liquidity_date->isPast() && 
               $this->isActive();
    }

    public function isSplitInvestment(): bool
    {
        return $this->is_split_investment;
    }

    public function hasAutoReinvest(): bool
    {
        return $this->auto_reinvest;
    }

    public function canBeApproved(): bool
    {
        return $this->isPending() && $this->user->canInvest();
    }

    public function canBeReinvested(): bool
    {
        return $this->isCompleted() && $this->actual_return > 0;
    }

    public function canBeModified(): bool
    {
        return $this->isPending() && !$this->modification_requested;
    }

    public function canBeCancelled(): bool
    {
        return $this->isPending() || $this->isPendingApproval();
    }

    public function canBeLiquidated(): bool
    {
        return $this->isLiquidatable();
    }

    // Investment validation methods
    public function validateInvestmentAmount(float $amount): array
    {
        $user = $this->user;
        $wallet = $user->wallet;
        
        $errors = [];
        
        if (!$wallet) {
            $errors[] = 'User wallet not found';
        } elseif (!$wallet->canWithdraw($amount)) {
            $errors[] = 'Insufficient wallet balance';
        } elseif ($amount < 500) {
            $errors[] = 'Minimum investment amount is ₹500';
        }
        
        return $errors;
    }

    public function validateUserEligibility(): array
    {
        $user = $this->user;
        $errors = [];
        
        if (!$user->isActive()) {
            $errors[] = 'User account must be active';
        }
        
        if (!$user->kyc_verified) {
            $errors[] = 'KYC verification required';
        }
        
        if ($user->registration_fee_paid < 500) {
            $errors[] = 'Registration fee must be paid';
        }
        
        // Check team requirements for team leaders
        if ($user->role === 'team_leader') {
            $team = $user->ledTeam;
            if (!$team || $team->member_count < 20) {
                $errors[] = 'Team must have at least 20 members';
            }
        }
        
        return $errors;
    }

    // Investment calculation methods
    public function calculateExpectedReturn(float $rate, int $months): float
    {
        return $this->amount * (1 + ($rate / 100) * ($months / 12));
    }

    public function calculateROI(): float
    {
        if ($this->amount == 0) return 0;
        
        $returns = $this->actual_return ?: $this->returns_generated;
        return (($returns - $this->amount) / $this->amount) * 100;
    }

    public function getAnnualizedReturn(): float
    {
        if (!$this->investment_date || !$this->approval_date) {
            return 0;
        }
        
        $investmentPeriod = $this->investment_date->diffInDays($this->approval_date);
        if ($investmentPeriod <= 0) return 0;
        
        $years = $investmentPeriod / 365.25;
        if ($years <= 0) return 0;
        
        return $this->calculateROI() / $years;
    }

    // Formatting methods
    public function getFormattedAmount(): string
    {
        return number_format((float) $this->amount, 2);
    }

    public function getFormattedExpectedReturn(): string
    {
        return number_format((float) $this->expected_return, 2);
    }

    public function getFormattedActualReturn(): string
    {
        return number_format((float) $this->actual_return, 2);
    }

    public function getFormattedROI(): string
    {
        return number_format($this->calculateROI(), 2) . '%';
    }

    // Investment lifecycle methods
    public function approve(): void
    {
        $this->update([
            'status' => 'active',
            'approval_date' => now(),
            'approved_by' => auth()->id(),
        ]);
        
        // Create investment transaction
        Transaction::create([
            'user_id' => $this->user_id,
            'wallet_id' => $this->user->wallet->id,
            'investment_id' => $this->id,
            'type' => 'investment',
            'amount' => $this->amount,
            'balance_before' => $this->user->wallet->balance,
            'balance_after' => $this->user->wallet->balance - $this->amount,
            'reference' => 'INV_' . strtoupper(uniqid()),
            'description' => "Investment in {$this->investment_type}",
            'status' => 'completed',
        ]);
        
        // Update wallet
        $this->user->wallet->deductBalance($this->amount);
        $this->user->wallet->addBalance($this->amount, 'investment'); // Add to investments total
    }

    public function complete(float $actualReturn): void
    {
        $this->update([
            'status' => 'completed',
            'actual_return' => $actualReturn,
        ]);
        
        // Create return transaction
        Transaction::create([
            'user_id' => $this->user_id,
            'wallet_id' => $this->user->wallet->id,
            'investment_id' => $this->id,
            'type' => 'profit',
            'amount' => $actualReturn,
            'balance_before' => $this->user->wallet->balance,
            'balance_after' => $this->user->wallet->balance + $actualReturn,
            'reference' => 'RET_' . strtoupper(uniqid()),
            'description' => "Return from investment #{$this->id}",
            'status' => 'completed',
        ]);
        
        // Update wallet
        $this->user->wallet->addBalance($actualReturn);
        $this->user->wallet->addBalance(0, 'profit'); // Add to profits total
    }

    public function cancel(string $reason): void
    {
        $this->update([
            'status' => 'cancelled',
            'notes' => $this->notes . "\n\nCancelled: " . $reason,
        ]);
        
        // Refund amount if investment was approved
        if ($this->isActive()) {
            Transaction::create([
                'user_id' => $this->user_id,
                'wallet_id' => $this->user->wallet->id,
                'investment_id' => $this->id,
                'type' => 'refund',
                'amount' => $this->amount,
                'balance_before' => $this->user->wallet->balance,
                'balance_after' => $this->user->wallet->balance + $this->amount,
                'reference' => 'REF_' . strtoupper(uniqid()),
                'description' => "Refund for cancelled investment #{$this->id}",
                'status' => 'completed',
            ]);
            
            $this->user->wallet->addBalance($this->amount);
        }
    }

    // Reporting methods
    public function getInvestmentSummary(): array
    {
        return [
            'id' => $this->id,
            'user' => $this->user->name,
            'amount' => $this->getFormattedAmount(),
            'type' => $this->investment_type,
            'status' => $this->status,
            'roi' => $this->getFormattedROI(),
            'investment_date' => $this->investment_date->format('Y-m-d'),
            'approval_date' => $this->approval_date?->format('Y-m-d'),
            'property' => $this->property?->name,
            'plot' => $this->plot?->plot_number,
            'expected_return' => $this->getFormattedExpectedReturn(),
            'actual_return' => $this->getFormattedActualReturn(),
            'reinvestment_count' => $this->reinvestment_count,
        ];
    }

    public static function getUserInvestmentStats(int $userId): array
    {
        $investments = self::where('user_id', $userId)->get();
        
        $totalInvested = $investments->sum('amount');
        $totalReturns = $investments->sum('actual_return');
        $activeInvestments = $investments->where('status', 'active')->count();
        $completedInvestments = $investments->where('status', 'completed')->count();
        
        return [
            'total_invested' => $totalInvested,
            'total_returns' => $totalReturns,
            'net_profit' => $totalReturns - $totalInvested,
            'total_investments' => $investments->count(),
            'active_investments' => $activeInvestments,
            'completed_investments' => $completedInvestments,
            'average_roi' => $totalInvested > 0 ? (($totalReturns - $totalInvested) / $totalInvested) * 100 : 0,
        ];
    }

    public static function getTeamInvestmentStats(int $teamId): array
    {
        $investments = self::byTeam($teamId)->get();
        
        $totalInvested = $investments->sum('amount');
        $totalReturns = $investments->sum('actual_return');
        $memberCount = $investments->pluck('user_id')->unique()->count();
        
        return [
            'team_id' => $teamId,
            'total_invested' => $totalInvested,
            'total_returns' => $totalReturns,
            'net_profit' => $totalReturns - $totalInvested,
            'member_count' => $memberCount,
            'investment_count' => $investments->count(),
            'average_investment_per_member' => $memberCount > 0 ? $totalInvested / $memberCount : 0,
            'average_roi' => $totalInvested > 0 ? (($totalReturns - $totalInvested) / $totalInvested) * 100 : 0,
        ];
    }
}
