<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
        'is_active',
        'min_amount',
        'max_amount',
        'processing_fee',
        'processing_fee_type',
        'settings',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'min_amount' => 'decimal:2',
            'max_amount' => 'decimal:2',
            'processing_fee' => 'decimal:2',
            'settings' => 'array',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForDeposit($query)
    {
        return $query->where(function ($q) {
            $q->where('type', 'deposit')->orWhere('type', 'both');
        });
    }

    public function scopeForWithdrawal($query)
    {
        return $query->where(function ($q) {
            $q->where('type', 'withdrawal')->orWhere('type', 'both');
        });
    }

    public function calculateProcessingFee(float $amount): float
    {
        if ($this->processing_fee_type === 'percentage') {
            return ($amount * $this->processing_fee) / 100;
        }
        
        return $this->processing_fee;
    }

    public function getNetAmount(float $amount): float
    {
        return $amount - $this->calculateProcessingFee($amount);
    }

    public function canProcessAmount(float $amount): bool
    {
        if ($amount < $this->min_amount) {
            return false;
        }
        
        if ($this->max_amount && $amount > $this->max_amount) {
            return false;
        }
        
        return true;
    }

    public function getFormattedMinAmount(): string
    {
        return number_format($this->min_amount, 2);
    }

    public function getFormattedMaxAmount(): ?string
    {
        return $this->max_amount ? number_format($this->max_amount, 2) : null;
    }

    public function getFormattedProcessingFee(): string
    {
        if ($this->processing_fee_type === 'percentage') {
            return $this->processing_fee . '%';
        }
        
        return '₹' . number_format($this->processing_fee, 2);
    }
}
