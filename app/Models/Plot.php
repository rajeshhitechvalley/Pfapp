<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plot extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_project_id',
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
        
        // REQ-PH-001: Additional plot creation fields
        'facing_direction', // North, South, East, West, North-East, etc.
        'road_width', // Width of road in front of plot
        'corner_plot', // Boolean for corner plots
        'double_road', // Boolean for double road facing
        'location_coordinates', // GPS coordinates
        'nearby_amenities', // JSON array of nearby amenities
        'soil_type', // Soil type information
        'topography', // Land topography
        'legal_clearance', // Legal clearance status
        'development_charges', // Additional development charges
        'maintenance_charges', // Annual maintenance charges
        
        // Plot holding related fields
        'is_held', // Boolean to indicate if plot is held
        'held_by_user_id', // User who is holding the plot
        'hold_start_date', // When the hold started
        'hold_expiry_date', // When the hold expires
        'hold_status', // active, expired, released
        'hold_notes', // Notes about the hold
        
        // Comparison and analytics
        'view_count', // Number of times plot was viewed
        'watchlist_count', // Number of users watching this plot
        'comparison_score', // Score for comparison features
        'popularity_rank', // Rank based on views and holds
        
        // Media and documentation
        'plot_images', // JSON array of plot images
        'layout_image', // Plot layout image
        'location_map', // Location map image
        'virtual_tour_link', // Link to virtual tour
        'documents', // JSON array of plot documents
        
        // Pricing and offers
        'original_price', // Original price before discounts
        'discount_percentage', // Discount percentage if any
        'special_offer', // Boolean for special offers
        'offer_expiry_date', // When special offer expires
        'negotiable', // Boolean if price is negotiable
        
        // Utilities and infrastructure
        'water_connection', // Water connection availability
        'electricity_connection', // Electricity connection availability
        'sewage_connection', // Sewage connection availability
        'gas_connection', // Gas connection availability
        'internet_connection', // Internet connection availability
        'road_access', // Type of road access
        
        // Additional metadata
        'tags', // JSON array of tags
        'priority_level', // Priority level for display
        'featured_plot', // Boolean for featured plots
        'last_modified_by', // User who last modified
        'verification_status', // Verification status of plot details
    ];

    protected function casts(): array
    {
        return [
            'area' => 'decimal:2',
            'price' => 'decimal:2',
            'price_per_sqft' => 'decimal:2',
            'road_facing' => 'boolean',
            'corner_plot' => 'boolean',
            'double_road' => 'boolean',
            'features' => 'array',
            'length' => 'decimal:2',
            'width' => 'decimal:2',
            'nearby_amenities' => 'array',
            'plot_images' => 'array',
            'documents' => 'array',
            'tags' => 'array',
            'special_offer' => 'boolean',
            'negotiable' => 'boolean',
            'water_connection' => 'boolean',
            'electricity_connection' => 'boolean',
            'sewage_connection' => 'boolean',
            'gas_connection' => 'boolean',
            'internet_connection' => 'boolean',
            'featured_plot' => 'boolean',
            'is_held' => 'boolean',
            'hold_start_date' => 'datetime',
            'hold_expiry_date' => 'datetime',
            'offer_expiry_date' => 'date',
        ];
    }

    public function property()
    {
        return $this->belongsTo(PropertyProject::class, 'property_project_id');
    }

    public function project()
    {
        return $this->belongsTo(PropertyProject::class, 'property_project_id');
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function plotHoldings()
    {
        return $this->hasMany(PlotHolding::class);
    }

    public function currentHolding()
    {
        return $this->hasOne(PlotHolding::class)->where('status', 'active');
    }

    public function sale()
    {
        return $this->hasOne(Sale::class);
    }

    public function heldByUser()
    {
        return $this->belongsTo(User::class, 'held_by_user_id');
    }

    public function watchlistUsers()
    {
        return $this->belongsToMany(User::class, 'plot_watchlist')
            ->withTimestamps();
    }

    public function comparisons()
    {
        return $this->belongsToMany(Plot::class, 'plot_comparisons', 'plot_1_id', 'plot_2_id')
            ->withTimestamps();
    }

    public function lastModifiedBy()
    {
        return $this->belongsTo(User::class, 'last_modified_by');
    }

    // Scopes for filtering
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeHeld($query)
    {
        return $query->where('is_held', true);
    }

    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('plot_type', $type);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('property_project_id', $projectId);
    }

    public function scopeByPriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }

    public function scopeByAreaRange($query, $minArea, $maxArea)
    {
        return $query->whereBetween('area', [$minArea, $maxArea]);
    }

    public function scopeCornerPlots($query)
    {
        return $query->where('corner_plot', true);
    }

    public function scopeDoubleRoad($query)
    {
        return $query->where('double_road', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured_plot', true);
    }

    public function scopeSpecialOffer($query)
    {
        return $query->where('special_offer', true)
            ->where('offer_expiry_date', '>=', now());
    }

    // Status methods
    public function isAvailable(): bool
    {
        return $this->status === 'available' && !$this->is_held;
    }

    public function isHeld(): bool
    {
        return $this->is_held && $this->hold_status === 'active';
    }

    public function isSold(): bool
    {
        return $this->status === 'sold';
    }

    public function isCornerPlot(): bool
    {
        return $this->corner_plot;
    }

    public function isDoubleRoad(): bool
    {
        return $this->double_road;
    }

    public function hasSpecialOffer(): bool
    {
        return $this->special_offer && 
               $this->offer_expiry_date && 
               $this->offer_expiry_date->isFuture();
    }

    public function canBeHeld(): bool
    {
        return $this->isAvailable() && !$this->is_held;
    }

    public function getFormattedPrice(): string
    {
        return number_format((float) $this->price, 2);
    }

    public function getFormattedArea(): string
    {
        return number_format((float) $this->area, 2) . ' ' . $this->area_unit;
    }

    public function getFacingDisplay(): string
    {
        $directions = [
            'N' => 'North',
            'NE' => 'North-East',
            'E' => 'East',
            'SE' => 'South-East',
            'S' => 'South',
            'SW' => 'South-West',
            'W' => 'West',
            'NW' => 'North-West',
        ];

        return $directions[$this->facing_direction] ?? 'Unknown';
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'available' => 'green',
            'held' => 'orange',
            'sold' => 'red',
            default => 'gray',
        };
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function incrementWatchlistCount(): void
    {
        $this->increment('watchlist_count');
    }

    public function addToWatchlist(int $userId): bool
    {
        if (!$this->watchlistUsers()->where('user_id', $userId)->exists()) {
            $this->watchlistUsers()->attach($userId);
            $this->incrementWatchlistCount();
            return true;
        }
        return false;
    }

    public function removeFromWatchlist(int $userId): bool
    {
        if ($this->watchlistUsers()->where('user_id', $userId)->exists()) {
            $this->watchlistUsers()->detach($userId);
            $this->decrement('watchlist_count');
            return true;
        }
        return false;
    }

    public function calculateComparisonScore(): float
    {
        // Calculate a score based on plot features
        $score = 0;
        
        // Area score (larger area = higher score)
        $score += $this->area * 0.1;
        
        // Corner plot bonus
        if ($this->corner_plot) {
            $score += 10;
        }
        
        // Double road bonus
        if ($this->double_road) {
            $score += 5;
        }
        
        // Road width score
        $score += $this->road_width * 0.5;
        
        // Features score
        if ($this->features) {
            $score += count($this->features) * 2;
        }
        
        // Amenities score
        if ($this->nearby_amenities) {
            $score += count($this->nearby_amenities) * 1;
        }
        
        return round($score, 2);
    }

    public function updateComparisonScore(): void
    {
        $this->update(['comparison_score' => $this->calculateComparisonScore()]);
    }

    public function getUtilityStatus(): array
    {
        return [
            'water' => $this->water_connection,
            'electricity' => $this->electricity_connection,
            'sewage' => $this->sewage_connection,
            'gas' => $this->gas_connection,
            'internet' => $this->internet_connection,
            'road_access' => $this->road_access,
        ];
    }

    public function getPlotSummary(): array
    {
        return [
            'id' => $this->id,
            'plot_number' => $this->plot_number,
            'area' => $this->getFormattedArea(),
            'price' => $this->getFormattedPrice(),
            'plot_type' => $this->plot_type,
            'facing' => $this->getFacingDisplay(),
            'status' => $this->status,
            'status_color' => $this->getStatusColor(),
            'is_corner' => $this->isCornerPlot(),
            'is_double_road' => $this->isDoubleRoad(),
            'is_held' => $this->isHeld(),
            'is_available' => $this->isAvailable(),
            'project' => $this->project,
            'utilities' => $this->getUtilityStatus(),
            'special_offer' => $this->hasSpecialOffer(),
            'discount_percentage' => $this->discount_percentage,
        ];
    }
}
