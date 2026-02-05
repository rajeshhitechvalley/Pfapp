<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlotHolding extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plot_id',
        'investment_id',
        'status',
        'hold_start_date',
        'hold_expiry_date',
        'lock_period_days',
        'transfer_allowed',
        'hold_value',
        'team_value_required',
        'investment_required',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'hold_start_date' => 'date',
            'hold_expiry_date' => 'date',
            'lock_period_days' => 'integer',
            'transfer_allowed' => 'boolean',
            'hold_value' => 'decimal:2',
            'team_value_required' => 'decimal:2',
            'investment_required' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plot()
    {
        return $this->belongsTo(Plot::class);
    }

    public function investment()
    {
        return $this->belongsTo(Investment::class);
    }
}
