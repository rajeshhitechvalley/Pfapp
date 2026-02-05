<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profit extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'user_id',
        'investment_id',
        'total_profit',
        'company_percentage',
        'company_share',
        'investor_share',
        'user_investment_amount',
        'team_contribution_amount',
        'total_project_investment',
        'profit_percentage',
        'status',
        'calculation_date',
        'distribution_date',
        'credit_date',
        'calculated_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_profit' => 'decimal:2',
            'company_percentage' => 'decimal:2',
            'company_share' => 'decimal:2',
            'investor_share' => 'decimal:2',
            'user_investment_amount' => 'decimal:2',
            'team_contribution_amount' => 'decimal:2',
            'total_project_investment' => 'decimal:2',
            'profit_percentage' => 'decimal:2',
            'calculation_date' => 'date',
            'distribution_date' => 'date',
            'credit_date' => 'date',
        ];
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function investment()
    {
        return $this->belongsTo(Investment::class);
    }

    public function calculator()
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }
}
