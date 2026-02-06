<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
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
        'payment_modes',
        'auto_deposit_settings',
        'two_factor_enabled',
        'daily_limit',
        'monthly_limit',
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
            'payment_modes' => 'array',
            'auto_deposit_settings' => 'array',
            'two_factor_enabled' => 'boolean',
            'daily_limit' => 'decimal:2',
            'monthly_limit' => 'decimal:2',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($wallet) {
            if (empty($wallet->wallet_id)) {
                $wallet->wallet_id = 'WLT' . strtoupper(Str::random(10));
            }
            if (empty($wallet->status)) {
                $wallet->status = 'active';
            }
        });
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

    public function canInvest(float $amount): bool
    {
        return $this->getAvailableBalance() >= $amount && $amount >= 500;
    }

    public function isWithinDailyLimit(float $amount): bool
    {
        if (!$this->daily_limit) return true;
        
        $todayTotal = $this->transactions()
            ->where('type', 'withdrawal')
            ->whereDate('created_at', today())
            ->where('status', 'completed')
            ->sum('amount');
            
        return ($todayTotal + $amount) <= $this->daily_limit;
    }

    public function isWithinMonthlyLimit(float $amount): bool
    {
        if (!$this->monthly_limit) return true;
        
        $monthTotal = $this->transactions()
            ->where('type', 'withdrawal')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', 'completed')
            ->sum('amount');
            
        return ($monthTotal + $amount) <= $this->monthly_limit;
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
        return '₹' . number_format((float) $this->balance, 2);
    }

    public function getFormattedAvailableBalance(): string
    {
        return '₹' . number_format($this->getAvailableBalance(), 2);
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

    public function getPaymentModes(): array
    {
        return $this->payment_modes ?? [
            'upi' => ['enabled' => true, 'daily_limit' => 50000],
            'card' => ['enabled' => true, 'daily_limit' => 100000],
            'net_banking' => ['enabled' => true, 'daily_limit' => 200000],
            'wallet' => ['enabled' => true, 'daily_limit' => 25000],
        ];
    }

    public function enablePaymentMode(string $mode, array $settings = []): void
    {
        $paymentModes = $this->payment_modes ?? [];
        $paymentModes[$mode] = array_merge(['enabled' => true], $settings);
        $this->update(['payment_modes' => $paymentModes]);
    }

    public function disablePaymentMode(string $mode): void
    {
        $paymentModes = $this->payment_modes ?? [];
        $paymentModes[$mode]['enabled'] = false;
        $this->update(['payment_modes' => $paymentModes]);
    }

    public function setAutoDeposit(array $settings): void
    {
        $this->update(['auto_deposit_settings' => $settings]);
    }

    public function getAutoDepositSettings(): array
    {
        return $this->auto_deposit_settings ?? [];
    }

    public function requiresTwoFactor(float $amount): bool
    {
        return $this->two_factor_enabled && $amount >= 10000;
    }

    public function enableTwoFactor(): void
    {
        $this->update(['two_factor_enabled' => true]);
    }

    public function disableTwoFactor(): void
    {
        $this->update(['two_factor_enabled' => false]);
    }

    public function setDailyLimit(float $limit): void
    {
        $this->update(['daily_limit' => $limit]);
    }

    public function setMonthlyLimit(float $limit): void
    {
        $this->update(['monthly_limit' => $limit]);
    }

    public function getTodayTransactions(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->transactions()
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getThisMonthTransactions(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->transactions()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTransactionStats(): array
    {
        $stats = [
            'today' => [
                'deposits' => 0,
                'withdrawals' => 0,
                'investments' => 0,
                'profits' => 0,
            ],
            'this_month' => [
                'deposits' => 0,
                'withdrawals' => 0,
                'investments' => 0,
                'profits' => 0,
            ],
            'last_month' => [
                'deposits' => 0,
                'withdrawals' => 0,
                'investments' => 0,
                'profits' => 0,
            ],
        ];

        // Today's stats
        $todayTransactions = $this->getTodayTransactions();
        foreach ($todayTransactions as $transaction) {
            if ($transaction->status === 'completed') {
                $stats['today'][$transaction->type] += $transaction->amount;
            }
        }

        // This month stats
        $thisMonthTransactions = $this->getThisMonthTransactions();
        foreach ($thisMonthTransactions as $transaction) {
            if ($transaction->status === 'completed') {
                $stats['this_month'][$transaction->type] += $transaction->amount;
            }
        }

        // Last month stats
        $lastMonthTransactions = $this->transactions()
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->where('status', 'completed')
            ->get();
        
        foreach ($lastMonthTransactions as $transaction) {
            $stats['last_month'][$transaction->type] += $transaction->amount;
        }

        return $stats;
    }
}
