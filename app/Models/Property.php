<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'total_area',
        'area_unit',
        'purchase_cost',
        'development_cost',
        'total_cost',
        'location',
        'address',
        'status',
        'tsp_approved',
        'tsp_approval_date',
        'government_approved',
        'government_approval_date',
        'total_plots',
        'available_plots',
        'sold_plots',
        'min_plot_price',
        'max_plot_price',
        'expected_completion',
        'actual_completion',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_area' => 'decimal:2',
            'purchase_cost' => 'decimal:2',
            'development_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'tsp_approved' => 'boolean',
            'tsp_approval_date' => 'date',
            'government_approved' => 'boolean',
            'government_approval_date' => 'date',
            'min_plot_price' => 'decimal:2',
            'max_plot_price' => 'decimal:2',
            'expected_completion' => 'date',
            'actual_completion' => 'date',
        ];
    }

    public function plots()
    {
        return $this->hasMany(Plot::class);
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
