<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'total_deposits',
        'total_withdrawals',
        'total_investments',
        'total_profits',
        'status',
        'notes',
        'last_transaction_at',
        'frozen_amount',
        'pending_amount',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'total_deposits' => 'decimal:2',
            'total_withdrawals' => 'decimal:2',
            'total_investments' => 'decimal:2',
            'total_profits' => 'decimal:2',
            'frozen_amount' => 'decimal:2',
            'pending_amount' => 'decimal:2',
            'last_transaction_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function deposits()
    {
        return $this->transactions()->where('type', 'deposit');
    }

    public function withdrawals()
    {
        return $this->transactions()->where('type', 'withdrawal');
    }

    public function investments()
    {
        return $this->transactions()->where('type', 'investment');
    }

    public function profitTransactions()
    {
        return $this->transactions()->where('type', 'profit');
    }

    public function pendingTransactions()
    {
        return $this->transactions()->where('status', 'pending');
    }

    public function completedTransactions()
    {
        return $this->transactions()->where('status', 'completed');
    }

    public function getAvailableBalance(): float
    {
        return $this->balance - $this->frozen_amount - $this->pending_amount;
    }

    public function canWithdraw(float $amount): bool
    {
        return $this->getAvailableBalance() >= $amount;
    }

    public function addBalance(float $amount, string $description = null): void
    {
        $this->balance = (float) $this->balance + $amount;
        $this->total_deposits = (float) $this->total_deposits + $amount;
        $this->last_transaction_at = now();
        $this->save();
    }

    public function deductBalance(float $amount, string $description = null): void
    {
        $this->balance = (float) $this->balance - $amount;
        $this->total_withdrawals = (float) $this->total_withdrawals + $amount;
        $this->last_transaction_at = now();
        $this->save();
    }

    public function freezeAmount(float $amount): void
    {
        $this->frozen_amount = (float) $this->frozen_amount + $amount;
        $this->save();
    }

    public function unfreezeAmount(float $amount): void
    {
        $this->frozen_amount = (float) $this->frozen_amount - $amount;
        $this->save();
    }

    public function addPendingAmount(float $amount): void
    {
        $this->pending_amount = (float) $this->pending_amount + $amount;
        $this->save();
    }

    public function removePendingAmount(float $amount): void
    {
        $this->pending_amount = (float) $this->pending_amount - $amount;
        $this->save();
    }

    public function isFrozen(): bool
    {
        return $this->status === 'frozen';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function getFormattedBalance(): string
    {
        return number_format((float) $this->balance, 2);
    }

    public function getFormattedAvailableBalance(): string
    {
        return number_format($this->getAvailableBalance(), 2);
    }

    public function getTransactionSummary(): array
    {
        return [
            'total_transactions' => $this->transactions()->count(),
            'pending_transactions' => $this->pendingTransactions()->count(),
            'completed_transactions' => $this->completedTransactions()->count(),
            'total_deposits' => $this->total_deposits,
            'total_withdrawals' => $this->total_withdrawals,
            'total_investments' => $this->total_investments,
            'total_profits' => $this->total_profits,
            'current_balance' => $this->balance,
            'available_balance' => $this->getAvailableBalance(),
            'frozen_amount' => $this->frozen_amount,
            'pending_amount' => $this->pending_amount,
        ];
    }

    public function getMonthlyTransactions(int $months = 12): \Illuminate\Database\Eloquent\Collection
    {
        return $this->transactions()
            ->where('created_at', '>=', now()->subMonths($months))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getDailyTransactions(int $days = 30): \Illuminate\Database\Eloquent\Collection
    {
        return $this->transactions()
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
