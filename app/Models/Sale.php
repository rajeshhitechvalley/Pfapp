<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'plot_id',
        'property_id',
        'buyer_name',
        'buyer_phone',
        'buyer_email',
        'buyer_address',
        'sale_price',
        'original_price',
        'profit_amount',
        'company_percentage',
        'company_profit',
        'investor_profit',
        'status',
        'sale_date',
        'confirmation_date',
        'handover_date',
        'initiated_by',
        'sale_agreement',
        'documents',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'sale_price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'profit_amount' => 'decimal:2',
            'company_percentage' => 'decimal:2',
            'company_profit' => 'decimal:2',
            'investor_profit' => 'decimal:2',
            'sale_date' => 'date',
            'confirmation_date' => 'date',
            'handover_date' => 'date',
        ];
    }

    public function plot()
    {
        return $this->belongsTo(Plot::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function profits()
    {
        return $this->hasMany(Profit::class);
    }
}
