<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referee_id',
        'team_id',
        'referral_code',
        'status',
        'joined_at',
        'commission_amount',
        'commission_paid',
        'commission_paid_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'commission_amount' => 'decimal:2',
            'commission_paid' => 'boolean',
            'commission_paid_at' => 'datetime',
        ];
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referee()
    {
        return $this->belongsTo(User::class, 'referee_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUnpaid($query)
    {
        return $query->where('commission_paid', false);
    }

    public function scopePaid($query)
    {
        return $query->where('commission_paid', true);
    }

    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'joined_at' => now(),
        ]);
    }

    public function payCommission()
    {
        $this->update([
            'commission_paid' => true,
            'commission_paid_at' => now(),
        ]);
    }
}
