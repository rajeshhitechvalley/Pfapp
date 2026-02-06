<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'user_id',
        'wallet_id',
        'type',
        'amount',
        'processing_fee',
        'net_amount',
        'balance_before',
        'balance_after',
        'reference',
        'description',
        'status',
        'payment_method_id',
        'payment_mode',
        'payment_reference',
        'payment_gateway',
        'gateway_transaction_id',
        'gateway_response',
        'investment_id',
        'profit_id',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'requires_2fa',
        'two_factor_verified_at',
        'ip_address',
        'user_agent',
        'notes',
        'metadata',
        'scheduled_at',
        'auto_deposit_settings',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'processing_fee' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'two_factor_verified_at' => 'datetime',
            'scheduled_at' => 'datetime',
            'requires_2fa' => 'boolean',
            'gateway_response' => 'array',
            'metadata' => 'array',
            'auto_deposit_settings' => 'array',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->transaction_id)) {
                $transaction->transaction_id = 'TXN' . strtoupper(uniqid());
            }
            if (empty($transaction->ip_address)) {
                $transaction->ip_address = request()->ip();
            }
            if (empty($transaction->user_agent)) {
                $transaction->user_agent = request()->userAgent();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function investment()
    {
        return $this->belongsTo(Investment::class);
    }

    public function profit()
    {
        return $this->belongsTo(Profit::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejecter()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeDeposits($query)
    {
        return $query->where('type', 'deposit');
    }

    public function scopeWithdrawals($query)
    {
        return $query->where('type', 'withdrawal');
    }

    public function scopeInvestments($query)
    {
        return $query->where('type', 'investment');
    }

    public function scopeProfits($query)
    {
        return $query->where('type', 'profit');
    }

    public function scopeRequiresApproval($query)
    {
        return $query->where('amount', '>=', 10000);
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_at');
    }

    public function scopeAutoDeposit($query)
    {
        return $query->whereNotNull('auto_deposit_settings');
    }

    // Status methods
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function canBeApproved(): bool
    {
        return $this->isPending() && !$this->requires_2fa || $this->two_factor_verified_at;
    }

    public function requiresTwoFactor(): bool
    {
        return $this->requires_2fa && !$this->two_factor_verified_at;
    }

    public function verifyTwoFactor(): void
    {
        $this->update(['two_factor_verified_at' => now()]);
    }

    public function approve($approverId = null): void
    {
        $this->update([
            'status' => 'completed',
            'approved_by' => $approverId ?? auth()->id(),
            'approved_at' => now(),
        ]);
    }

    public function reject(string $reason, $rejecterId = null): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'rejected_by' => $rejecterId ?? auth()->id(),
            'rejected_at' => now(),
        ]);
    }

    public function fail(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'rejection_reason' => $reason,
        ]);
    }

    // Payment gateway methods
    public function isGatewayProcessed(): bool
    {
        return !empty($this->gateway_transaction_id);
    }

    public function getGatewayStatus(): string
    {
        return $this->gateway_response['status'] ?? 'unknown';
    }

    public function isGatewaySuccessful(): bool
    {
        return $this->getGatewayStatus() === 'success';
    }

    public function setGatewayResponse(array $response): void
    {
        $this->update([
            'gateway_response' => $response,
            'gateway_transaction_id' => $response['transaction_id'] ?? null,
        ]);
    }

    // Formatting methods
    public function getFormattedAmount(): string
    {
        return '₹' . number_format($this->amount, 2);
    }

    public function getFormattedNetAmount(): string
    {
        return '₹' . number_format($this->net_amount, 2);
    }

    public function getFormattedProcessingFee(): string
    {
        return '₹' . number_format($this->processing_fee, 2);
    }

    public function getFormattedBalanceBefore(): string
    {
        return '₹' . number_format($this->balance_before, 2);
    }

    public function getFormattedBalanceAfter(): string
    {
        return '₹' . number_format($this->balance_after, 2);
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'completed' => 'green',
            'pending' => 'yellow',
            'rejected' => 'red',
            'failed' => 'red',
            default => 'gray',
        };
    }

    public function getStatusBadge(): string
    {
        return match($this->status) {
            'completed' => 'success',
            'pending' => 'warning',
            'rejected' => 'danger',
            'failed' => 'danger',
            default => 'secondary',
        };
    }

    public function getTypeIcon(): string
    {
        return match($this->type) {
            'deposit' => 'arrow-down',
            'withdrawal' => 'arrow-up',
            'investment' => 'trending-up',
            'profit' => 'dollar-sign',
            default => 'circle',
        };
    }

    public function getTypeColor(): string
    {
        return match($this->type) {
            'deposit' => 'green',
            'withdrawal' => 'red',
            'investment' => 'blue',
            'profit' => 'purple',
            default => 'gray',
        };
    }

    // Security methods
    public function isHighValue(): bool
    {
        return $this->amount >= 50000;
    }

    public function isSuspicious(): bool
    {
        // Add suspicious activity detection logic
        return false;
    }

    public function getSecurityFlags(): array
    {
        $flags = [];

        if ($this->isHighValue()) {
            $flags[] = 'high_value';
        }

        if ($this->requires_2fa) {
            $flags[] = 'requires_2fa';
        }

        if ($this->isSuspicious()) {
            $flags[] = 'suspicious';
        }

        return $flags;
    }

    // Auto-deposit methods
    public function isScheduled(): bool
    {
        return !is_null($this->scheduled_at);
    }

    public function isAutoDeposit(): bool
    {
        return !is_null($this->auto_deposit_settings);
    }

    public function getScheduleDescription(): string
    {
        if (!$this->isScheduled()) {
            return 'Immediate';
        }

        $settings = $this->auto_deposit_settings;
        $frequency = $settings['frequency'] ?? 'once';
        $day = $settings['day'] ?? null;

        return match($frequency) {
            'daily' => 'Daily',
            'weekly' => "Weekly on " . ($day ?? 'Monday'),
            'monthly' => "Monthly on " . ($day ?? '1st'),
            default => 'Once',
        };
    }

    // Export methods
    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'formatted_amount' => $this->getFormattedAmount(),
            'formatted_net_amount' => $this->getFormattedNetAmount(),
            'formatted_processing_fee' => $this->getFormattedProcessingFee(),
            'status_color' => $this->getStatusColor(),
            'status_badge' => $this->getStatusBadge(),
            'type_icon' => $this->getTypeIcon(),
            'type_color' => $this->getTypeColor(),
            'security_flags' => $this->getSecurityFlags(),
        ]);
    }

    // Relationships for audit trail
    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable');
    }

    public function createAuditLog(string $action, array $data = []): void
    {
        $this->auditLogs()->create([
            'action' => $action,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'data' => $data,
        ]);
    }
}
