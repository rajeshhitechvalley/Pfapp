<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PropertyProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'location',
        'address',
        'city',
        'state',
        'country',
        'pincode',
        'total_area',
        'total_plots',
        'available_plots',
        'sold_plots',
        'price_per_plot',
        'total_value',
        'development_cost',
        'legal_cost',
        'marketing_cost',
        'infrastructure_cost',
        'total_cost',
        'expected_roi',
        'projected_completion_date',
        'actual_completion_date',
        'status',
        'approval_status',
        'legal_approval_status',
        'government_approval_status',
        'tsp_approval_status',
        'approved_by',
        'approved_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'total_area' => 'decimal:2',
        'total_plots' => 'integer',
        'available_plots' => 'integer',
        'sold_plots' => 'integer',
        'price_per_plot' => 'decimal:2',
        'total_value' => 'decimal:2',
        'development_cost' => 'decimal:2',
        'legal_cost' => 'decimal:2',
        'marketing_cost' => 'decimal:2',
        'infrastructure_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'expected_roi' => 'decimal:2',
        'projected_completion_date' => 'date',
        'actual_completion_date' => 'date',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function plots(): HasMany
    {
        return $this->hasMany(Plot::class, 'property_project_id');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'property_project_id');
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class, 'property_project_id');
    }

    public function profits(): HasMany
    {
        return $this->hasMany(Profit::class, 'property_project_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
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

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByLocation($query, $location)
    {
        return $query->where('location', 'like', "%{$location}%");
    }

    // Accessors
    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_plots === 0) {
            return 0;
        }
        
        return round(($this->sold_plots / $this->total_plots) * 100, 2);
    }

    public function getRemainingPlotsAttribute(): int
    {
        return $this->total_plots - $this->sold_plots;
    }

    public function getCompletionStatusAttribute(): string
    {
        if ($this->status === 'completed') {
            return 'Completed';
        } elseif ($this->actual_completion_date) {
            $daysOverdue = Carbon::parse($this->actual_completion_date)->diffInDays(now());
            return $daysOverdue > 0 ? 'Overdue' : 'On Track';
        } elseif ($this->projected_completion_date) {
            $daysRemaining = Carbon::parse($this->projected_completion_date)->diffInDays(now());
            return $daysRemaining < 30 ? 'Critical' : 'On Track';
        }
        
        return 'Not Started';
    }

    public function getInvestmentStatusAttribute(): string
    {
        $investmentPercentage = $this->getInvestmentPercentageAttribute();
        
        if ($investmentPercentage >= 90) {
            return 'Fully Funded';
        } elseif ($investmentPercentage >= 50) {
            return 'Well Funded';
        } elseif ($investmentPercentage > 0) {
            return 'Partially Funded';
        }
        
        return 'Not Funded';
    }

    public function getInvestmentPercentageAttribute(): float
    {
        if ($this->total_value == 0) {
            return 0;
        }
        
        $totalInvested = $this->investments()->sum('amount');
        return round(($totalInvested / $this->total_value) * 100, 2);
    }

    // Business Logic Methods
    public function canInvest(): bool
    {
        return $this->status === 'active' && $this->available_plots > 0;
    }

    public function canEdit(): bool
    {
        return in_array($this->status, ['pending', 'active']);
    }

    public function canApprove(): bool
    {
        return $this->approval_status === 'pending' && 
               $this->legal_approval_status === 'approved' &&
               $this->government_approval_status === 'approved';
    }

    public function approve(int $approvedBy): bool
    {
        if (!$this->canApprove()) {
            return false;
        }

        $this->update([
            'approval_status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
            'status' => 'active'
        ]);

        return true;
    }

    public function reject(string $reason, int $rejectedBy): bool
    {
        if ($this->approval_status !== 'pending') {
            return false;
        }

        $this->update([
            'approval_status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approved_at' => now(),
            'status' => 'rejected'
        ]);

        return true;
    }

    public function updateProgress(int $soldPlots, int $availablePlots): bool
    {
        return $this->update([
            'sold_plots' => $soldPlots,
            'available_plots' => $availablePlots,
            'updated_by' => auth()->id(),
        ]);
    }

    public function calculateProfitability(): array
    {
        $totalRevenue = $this->sales()->sum('sale_price');
        $totalCost = $this->total_cost;
        $profit = $totalRevenue - $totalCost;
        $profitMargin = $totalRevenue > 0 ? ($profit / $totalRevenue) * 100 : 0;

        return [
            'total_revenue' => $totalRevenue,
            'total_cost' => $totalCost,
            'profit' => $profit,
            'profit_margin' => round($profitMargin, 2),
            'roi_percentage' => $this->expected_roi,
        ];
    }

    public function getDevelopmentStatus(): array
    {
        $totalPlots = $this->total_plots;
        $soldPlots = $this->sold_plots;
        $availablePlots = $this->available_plots;

        return [
            'total_plots' => $totalPlots,
            'sold_plots' => $soldPlots,
            'available_plots' => $availablePlots,
            'completion_percentage' => $this->progress_percentage,
            'status' => $this->completion_status,
        ];
    }

    public function getLegalApprovals(): array
    {
        return [
            'legal_approval_status' => $this->legal_approval_status,
            'government_approval_status' => $this->government_approval_status,
            'tsp_approval_status' => $this->tsp_approval_status,
            'overall_status' => $this->approval_status,
            'approved_by' => $this->approvedBy,
            'approved_at' => $this->approved_at,
        ];
    }

    public function getFinancialSummary(): array
    {
        return [
            'total_value' => $this->total_value,
            'total_cost' => $this->total_cost,
            'development_cost' => $this->development_cost,
            'legal_cost' => $this->legal_cost,
            'marketing_cost' => $this->marketing_cost,
            'infrastructure_cost' => $this->infrastructure_cost,
            'price_per_plot' => $this->price_per_plot,
            'expected_roi' => $this->expected_roi,
            'profitability' => $this->calculateProfitability(),
        ];
    }
}
