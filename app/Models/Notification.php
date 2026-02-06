<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'read',
        'data',
    ];

    protected $casts = [
        'read' => 'boolean',
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): bool
    {
        return $this->update(['read' => true]);
    }

    public function markAsUnread(): bool
    {
        return $this->update(['read' => false]);
    }

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('read', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function getIconAttribute(): string
    {
        return match($this->type) {
            'team_activation' => 'users',
            'investment_confirmation' => 'trending-up',
            'profit_credit' => 'dollar-sign',
            'hold_expiry' => 'clock',
            'new_project' => 'building',
            'announcement' => 'bell',
            'system' => 'settings',
            default => 'info',
        };
    }

    public function getColorAttribute(): string
    {
        return match($this->type) {
            'team_activation' => 'blue',
            'investment_confirmation' => 'green',
            'profit_credit' => 'emerald',
            'hold_expiry' => 'orange',
            'new_project' => 'purple',
            'announcement' => 'indigo',
            'system' => 'gray',
            default => 'gray',
        };
    }
}
