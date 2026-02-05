<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plot extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'plot_number',
        'area',
        'area_unit',
        'price',
        'price_per_sqft',
        'plot_type',
        'road_facing',
        'status',
        'description',
        'features',
        'dimensions',
        'length',
        'width',
        'location_details',
    ];

    protected function casts(): array
    {
        return [
            'area' => 'decimal:2',
            'price' => 'decimal:2',
            'price_per_sqft' => 'decimal:2',
            'road_facing' => 'boolean',
            'features' => 'array',
            'length' => 'decimal:2',
            'width' => 'decimal:2',
        ];
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function plotHoldings()
    {
        return $this->hasMany(PlotHolding::class);
    }

    public function sale()
    {
        return $this->hasOne(Sale::class);
    }
}
