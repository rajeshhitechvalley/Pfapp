<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Reinvestment extends Model
{
    use HasFactory;

    protected $fillable = [
        'profit_id',
        'user_id',
        'amount',
        'reinvestment_date',
        'status',
        'target_property_project_id',
        'target_plot_id',
        'investment_id',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'reinvestment_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function profit(): BelongsTo
    {
        return $this->belongsTo(Profit::class, 'profit_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function targetProperty(): BelongsTo
    {
        return $this->belongsTo(PropertyProject::class, 'target_property_project_id');
    }

    public function targetPlot(): BelongsTo
    {
        return $this->belongsTo(Plot::class, 'target_plot_id');
    }

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class, 'investment_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByProfit($query, $profitId)
    {
        return $query->where('profit_id', $profitId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('reinvestment_date', $startDate, $endDate);
    }

    // Accessors
    public function getReinvestmentStatusAttribute(): string
    {
        return match($this->status) {
            'active' => 'Active',
            'completed' => 'Completed',
            'pending' => 'Pending',
            'cancelled' => 'Cancelled',
            default => 'Unknown',
        };
    }

    public function getFormattedAmount(): string
    {
        return '₹' . number_format($this->amount, 2);
    }

    public function getDaysSinceReinvestmentAttribute(): int
    {
        return Carbon::parse($this->reinvestment_date)->diffInDays(now());
    }

    public function getReinvestmentPeriodAttribute(): string
    {
        return $this->reinvestment_date->format('Y-m-d') . ' to ' . now()->format('Y-m-d');
    }

    public function getTargetDescriptionAttribute(): string
    {
        if ($this->targetProperty) {
            return $this->targetProperty->name;
        }
        
        if ($this->targetPlot) {
            return $this->targetPlot->plot_number;
        }
        
        return 'Not specified';
    }

    public function getReinvestmentDetails(): array
    {
        return [
            'id' => $this->id,
            'profit_id' => $this->profit_id,
            'user' => $this->user->name,
            'amount' => $this->getFormattedAmount(),
            'reinvestment_date' => $this->reinvestment_date->format('Y-m-d'),
            'status' => $this->getReinvestmentStatusAttribute(),
            'target' => $this->getTargetDescriptionAttribute(),
            'target_property' => $this->targetProperty?->name,
            'target_plot' => $this->targetPlot?->plot_number,
            'investment' => $this->investment,
            'days_since_reinvestment' => $this->getDaysSinceReinvestmentAttribute(),
            'reinvestment_period' => $this->getReinvestmentPeriodAttribute(),
        ];
    }

    // Business Logic Methods
    public function createReinvestment(array $data): self
    {
        $reinvestment = $this->create(array_merge($data, [
            'reinvestment_date' => now(),
            'status' => 'active',
            'created_by' => auth()->id(),
        ]));

        return $reinvestment;
    }

    public function completeReinvestment(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'updated_by' => auth()->id(),
        ]);

        return true;
    }

    public function cancelReinvestment(string $reason): bool
    {
        if ($this->status === 'completed') {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
            'notes' => $reason,
            'updated_by' => auth()->id(),
        ]);

        return true;
    }

    public function getReinvestmentSummary($startDate, $endDate): array
    {
        return $this->whereBetween('reinvestment_date', $startDate, $endDate)
            ->selectRaw('
                COUNT(*) as total_reinvestments,
                SUM(amount) as total_reinvested_amount,
                AVG(amount) as avg_reinvestment_amount,
                MAX(amount) as max_reinvestment_amount,
                SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active_reinvestments,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_reinvestments,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_reinvestments
            ')
            ->first()
            ->toArray();
    }

    public function getUserReinvestmentSummary(int $userId): array
    {
        return $this->where('user_id', $userId)
            ->selectRaw('
                COUNT(*) as total_reinvestments,
                SUM(amount) as total_reinvested_amount,
                AVG(amount) as avg_reinvestment_amount,
                MAX(amount) as max_reinvestment_amount,
                SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active_reinvestments,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_reinvestments,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_reinvestments
            ')
            ->first()
            ->toArray();
    }

    public function getReinvestmentTrends($startDate, $endDate): array
    {
        return $this->whereBetween('reinvestment_date', $startDate, $endDate)
            ->selectRaw('
                DATE_FORMAT(reinvestment_date, "%Y-%m") as month,
                COUNT(*) as reinvestment_count,
                SUM(amount) as total_reinvested,
                AVG(amount) as avg_reinvestment_amount
            ')
            ->groupByRaw('DATE_FORMAT(reinvestment_date, "%Y-%m")')
            ->orderBy('month', 'desc')
            ->get()
            ->toArray();
    }
}
