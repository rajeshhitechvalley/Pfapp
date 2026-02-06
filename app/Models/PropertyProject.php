<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PropertyProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'location',
        'address',
        'city',
        'state',
        'country',
        'pincode',
        'total_area',
        'total_plots',
        'available_plots',
        'sold_plots',
        'held_plots',
        'price_per_plot',
        'total_value',
        'land_purchase_cost',
        'legal_cost',
        'development_cost',
        'construction_cost',
        'marketing_cost',
        'admin_cost',
        'infrastructure_cost',
        'total_cost',
        'budget_cost',
        'expected_roi',
        'projected_completion_date',
        'actual_completion_date',
        'status',
        'development_phase',
        'approval_status',
        'legal_approval_status',
        'government_approval_status',
        'tsp_approval_status',
        'approved_by',
        'approved_at',
        'created_by',
        'updated_by',
        
        // Land Purchase Details
        'seller_name',
        'seller_contact',
        'seller_address',
        'survey_numbers',
        'registration_number',
        'registration_date',
        'land_purchase_date',
        'payment_terms',
        'payment_schedule',
        
        // Legal Approval Details - TSP
        'tsp_application_date',
        'tsp_application_number',
        'tsp_approval_date',
        'tsp_rejection_reason',
        'tsp_approval_documents',
        
        // Legal Approval Details - Government
        'environmental_clearance_status',
        'environmental_clearance_date',
        'fire_noc_status',
        'fire_noc_date',
        'water_connection_status',
        'water_connection_date',
        'electricity_connection_status',
        'electricity_connection_date',
        'building_plan_status',
        'building_plan_date',
        'occupation_certificate_status',
        'occupation_certificate_date',
        'rera_registration_status',
        'rera_registration_number',
        'rera_registration_date',
        
        // Gallery and Media
        'featured_image',
        'gallery_images',
        'videos',
        'before_photos',
        'during_photos',
        'after_photos',
        
        // Layout and Planning
        'layout_blueprint',
        'layout_approved_date',
        'plot numbering_scheme',
        'road_width',
        'open_space_percentage',
        'amenity_area',
        
        // Development Tracking
        'land_acquisition_date',
        'planning_start_date',
        'planning_completion_date',
        'infrastructure_start_date',
        'infrastructure_completion_date',
        'amenities_start_date',
        'amenities_completion_date',
        'handover_date',
        
        // Financial Tracking
        'total_revenue',
        'gross_profit',
        'net_profit',
        'roi_percentage',
        'investor_share_percentage',
        'investor_share_amount',
        
        // Additional Metadata
        'project_code',
        'latitude',
        'longitude',
        'google_maps_link',
        'nearby_landmarks',
        'connectivity',
        'special_features',
        'terms_and_conditions',
    ];

    protected $casts = [
        'total_area' => 'decimal:2',
        'total_plots' => 'integer',
        'available_plots' => 'integer',
        'sold_plots' => 'integer',
        'held_plots' => 'integer',
        'price_per_plot' => 'decimal:2',
        'total_value' => 'decimal:2',
        'land_purchase_cost' => 'decimal:2',
        'legal_cost' => 'decimal:2',
        'development_cost' => 'decimal:2',
        'construction_cost' => 'decimal:2',
        'marketing_cost' => 'decimal:2',
        'admin_cost' => 'decimal:2',
        'infrastructure_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'budget_cost' => 'decimal:2',
        'expected_roi' => 'decimal:2',
        'projected_completion_date' => 'date',
        'actual_completion_date' => 'date',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        
        // Land Purchase Dates
        'registration_date' => 'date',
        'land_purchase_date' => 'date',
        
        // Legal Approval Dates
        'tsp_application_date' => 'date',
        'tsp_approval_date' => 'date',
        'environmental_clearance_date' => 'date',
        'fire_noc_date' => 'date',
        'water_connection_date' => 'date',
        'electricity_connection_date' => 'date',
        'building_plan_date' => 'date',
        'occupation_certificate_date' => 'date',
        'rera_registration_date' => 'date',
        
        // Layout and Planning
        'layout_approved_date' => 'date',
        
        // Development Tracking Dates
        'land_acquisition_date' => 'date',
        'planning_start_date' => 'date',
        'planning_completion_date' => 'date',
        'infrastructure_start_date' => 'date',
        'infrastructure_completion_date' => 'date',
        'amenities_start_date' => 'date',
        'amenities_completion_date' => 'date',
        'handover_date' => 'date',
        
        // Financial Tracking
        'total_revenue' => 'decimal:2',
        'gross_profit' => 'decimal:2',
        'net_profit' => 'decimal:2',
        'roi_percentage' => 'decimal:2',
        'investor_share_percentage' => 'decimal:2',
        'investor_share_amount' => 'decimal:2',
        
        // Media and Documents
        'gallery_images' => 'array',
        'videos' => 'array',
        'before_photos' => 'array',
        'during_photos' => 'array',
        'after_photos' => 'array',
        'tsp_approval_documents' => 'array',
        'payment_schedule' => 'array',
        'special_features' => 'array',
        'terms_and_conditions' => 'array',
    ];

    // Relationships
    public function plots(): HasMany
    {
        return $this->hasMany(Plot::class, 'property_project_id');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'property_project_id');
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class, 'property_project_id');
    }

    public function profits(): HasMany
    {
        return $this->hasMany(Profit::class, 'property_project_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByLocation($query, $location)
    {
        return $query->where('location', 'like', "%{$location}%");
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDevelopmentPhase($query, $phase)
    {
        return $query->where('development_phase', $phase);
    }

    public function scopeByApprovalStatus($query, $status)
    {
        return $query->where('approval_status', $status);
    }

    public function scopeTspApproved($query)
    {
        return $query->where('tsp_approval_status', 'approved');
    }

    public function scopeGovernmentApproved($query)
    {
        return $query->where('government_approval_status', 'approved');
    }

    public function scopeReadyForSale($query)
    {
        return $query->where('status', 'ready_for_sale');
    }

    public function scopeUnderDevelopment($query)
    {
        return $query->where('status', 'under_development');
    }

    public function scopeLandAcquired($query)
    {
        return $query->where('status', 'land_acquired');
    }

    // Accessors
    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_plots === 0) {
            return 0;
        }
        
        return round(($this->sold_plots / $this->total_plots) * 100, 2);
    }

    public function getRemainingPlotsAttribute(): int
    {
        return $this->total_plots - $this->sold_plots;
    }

    public function getCompletionStatusAttribute(): string
    {
        if ($this->status === 'completed') {
            return 'Completed';
        } elseif ($this->actual_completion_date) {
            $daysOverdue = Carbon::parse($this->actual_completion_date)->diffInDays(now());
            return $daysOverdue > 0 ? 'Overdue' : 'On Track';
        } elseif ($this->projected_completion_date) {
            $daysRemaining = Carbon::parse($this->projected_completion_date)->diffInDays(now());
            return $daysRemaining < 30 ? 'Critical' : 'On Track';
        }
        
        return 'Not Started';
    }

    public function getInvestmentStatusAttribute(): string
    {
        $investmentPercentage = $this->getInvestmentPercentageAttribute();
        
        if ($investmentPercentage >= 90) {
            return 'Fully Funded';
        } elseif ($investmentPercentage >= 50) {
            return 'Well Funded';
        } elseif ($investmentPercentage > 0) {
            return 'Partially Funded';
        }
        
        return 'Not Funded';
    }

    public function getInvestmentPercentageAttribute(): float
    {
        if ($this->total_value == 0) {
            return 0;
        }
        
        $totalInvested = $this->investments()->sum('amount');
        return round(($totalInvested / $this->total_value) * 100, 2);
    }

    // Business Logic Methods
    public function canInvest(): bool
    {
        return $this->status === 'active' && $this->available_plots > 0;
    }

    public function canEdit(): bool
    {
        return in_array($this->status, ['pending', 'planned', 'land_acquired']);
    }

    public function canApprove(): bool
    {
        return $this->approval_status === 'pending' && 
               $this->tsp_approval_status === 'approved' &&
               $this->government_approval_status === 'approved';
    }

    public function approve(int $approvedBy): bool
    {
        if (!$this->canApprove()) {
            return false;
        }

        $this->update([
            'approval_status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
            'status' => 'active'
        ]);

        return true;
    }

    public function reject(string $reason, int $rejectedBy): bool
    {
        if ($this->approval_status !== 'pending') {
            return false;
        }

        $this->update([
            'approval_status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approved_at' => now(),
            'status' => 'rejected'
        ]);

        return true;
    }

    public function updateProgress(int $soldPlots, int $availablePlots): bool
    {
        return $this->update([
            'sold_plots' => $soldPlots,
            'available_plots' => $availablePlots,
            'updated_by' => auth()->id(),
        ]);
    }

    public function calculateProfitability(): array
    {
        $totalRevenue = $this->sales()->sum('sale_price');
        $totalCost = $this->total_cost;
        $grossProfit = $totalRevenue - $totalCost;
        $netProfit = $this->net_profit ?? $grossProfit;
        $profitMargin = $totalRevenue > 0 ? ($grossProfit / $totalRevenue) * 100 : 0;
        $roi = $totalCost > 0 ? (($totalRevenue - $totalCost) / $totalCost) * 100 : 0;

        return [
            'total_revenue' => $totalRevenue,
            'total_cost' => $totalCost,
            'gross_profit' => $grossProfit,
            'net_profit' => $netProfit,
            'profit_margin' => round($profitMargin, 2),
            'roi_percentage' => round($roi, 2),
            'investor_share_amount' => $this->investor_share_amount ?? 0,
            'investor_share_percentage' => $this->investor_share_percentage ?? 0,
        ];
    }

    public function getDevelopmentStatus(): array
    {
        $phases = [
            'land_acquisition' => [
                'name' => 'Land Acquisition',
                'start_date' => $this->land_acquisition_date,
                'completion_date' => $this->land_acquisition_date,
                'status' => $this->land_acquisition_date ? 'completed' : 'pending',
            ],
            'legal_approvals' => [
                'name' => 'Legal Approvals',
                'start_date' => $this->tsp_application_date,
                'completion_date' => $this->tsp_approval_date,
                'status' => $this->tsp_approval_status,
            ],
            'planning' => [
                'name' => 'Planning',
                'start_date' => $this->planning_start_date,
                'completion_date' => $this->planning_completion_date,
                'status' => $this->planning_completion_date ? 'completed' : ($this->planning_start_date ? 'in_progress' : 'pending'),
            ],
            'infrastructure' => [
                'name' => 'Infrastructure Development',
                'start_date' => $this->infrastructure_start_date,
                'completion_date' => $this->infrastructure_completion_date,
                'status' => $this->infrastructure_completion_date ? 'completed' : ($this->infrastructure_start_date ? 'in_progress' : 'pending'),
            ],
            'amenities' => [
                'name' => 'Amenities Development',
                'start_date' => $this->amenities_start_date,
                'completion_date' => $this->amenities_completion_date,
                'status' => $this->amenities_completion_date ? 'completed' : ($this->amenities_start_date ? 'in_progress' : 'pending'),
            ],
            'handover' => [
                'name' => 'Handover Ready',
                'start_date' => $this->handover_date,
                'completion_date' => $this->handover_date,
                'status' => $this->handover_date ? 'completed' : 'pending',
            ],
        ];

        return [
            'current_phase' => $this->development_phase,
            'phases' => $phases,
            'overall_progress' => $this->calculateOverallProgress($phases),
        ];
    }

    private function calculateOverallProgress(array $phases): float
    {
        $completedPhases = collect($phases)->filter(function ($phase) {
            return $phase['status'] === 'completed';
        })->count();

        return ($completedPhases / count($phases)) * 100;
    }

    public function getLegalApprovals(): array
    {
        return [
            'tsp' => [
                'status' => $this->tsp_approval_status,
                'application_date' => $this->tsp_application_date,
                'application_number' => $this->tsp_application_number,
                'approval_date' => $this->tsp_approval_date,
                'rejection_reason' => $this->tsp_rejection_reason,
                'documents' => $this->tsp_approval_documents ?? [],
            ],
            'government' => [
                'environmental_clearance' => [
                    'status' => $this->environmental_clearance_status,
                    'date' => $this->environmental_clearance_date,
                ],
                'fire_noc' => [
                    'status' => $this->fire_noc_status,
                    'date' => $this->fire_noc_date,
                ],
                'water_connection' => [
                    'status' => $this->water_connection_status,
                    'date' => $this->water_connection_date,
                ],
                'electricity_connection' => [
                    'status' => $this->electricity_connection_status,
                    'date' => $this->electricity_connection_date,
                ],
                'building_plan' => [
                    'status' => $this->building_plan_status,
                    'date' => $this->building_plan_date,
                ],
                'occupation_certificate' => [
                    'status' => $this->occupation_certificate_status,
                    'date' => $this->occupation_certificate_date,
                ],
                'rera_registration' => [
                    'status' => $this->rera_registration_status,
                    'number' => $this->rera_registration_number,
                    'date' => $this->rera_registration_date,
                ],
            ],
        ];
    }

    public function getSalesTracking(): array
    {
        $totalPlots = $this->total_plots;
        $soldPlots = $this->sold_plots;
        $heldPlots = $this->held_plots ?? 0;
        $availablePlots = $this->available_plots;
        
        $totalSalesValue = $this->sales()->sum('sale_price');
        $receivedAmount = $this->sales()->where('payment_status', 'completed')->sum('amount_paid');
        $pendingAmount = $totalSalesValue - $receivedAmount;
        
        return [
            'total_plots' => $totalPlots,
            'sold_plots' => $soldPlots,
            'held_plots' => $heldPlots,
            'available_plots' => $availablePlots,
            'sales_percentage' => $totalPlots > 0 ? round(($soldPlots / $totalPlots) * 100, 2) : 0,
            'total_sales_value' => $totalSalesValue,
            'received_amount' => $receivedAmount,
            'pending_amount' => $pendingAmount,
            'average_plot_price' => $soldPlots > 0 ? round($totalSalesValue / $soldPlots, 2) : $this->price_per_plot,
        ];
    }

    public function getCostTracking(): array
    {
        $budgetCost = $this->budget_cost ?? $this->total_cost;
        $actualCost = $this->total_cost;
        $variance = $actualCost - $budgetCost;
        $variancePercentage = $budgetCost > 0 ? round(($variance / $budgetCost) * 100, 2) : 0;

        return [
            'budget_cost' => $budgetCost,
            'actual_cost' => $actualCost,
            'variance' => $variance,
            'variance_percentage' => $variancePercentage,
            'cost_breakdown' => [
                'land_purchase' => $this->land_purchase_cost ?? 0,
                'legal' => $this->legal_cost ?? 0,
                'development' => $this->development_cost ?? 0,
                'construction' => $this->construction_cost ?? 0,
                'marketing' => $this->marketing_cost ?? 0,
                'admin' => $this->admin_cost ?? 0,
                'infrastructure' => $this->infrastructure_cost ?? 0,
            ],
        ];
    }

    public function getGallery(): array
    {
        return [
            'featured_image' => $this->featured_image,
            'gallery_images' => $this->gallery_images ?? [],
            'videos' => $this->videos ?? [],
            'before_photos' => $this->before_photos ?? [],
            'during_photos' => $this->during_photos ?? [],
            'after_photos' => $this->after_photos ?? [],
        ];
    }

    public function updateFinancials(): void
    {
        $salesData = $this->getSalesTracking();
        $costData = $this->getCostTracking();
        
        $totalRevenue = $salesData['total_sales_value'];
        $totalCost = $costData['actual_cost'];
        $grossProfit = $totalRevenue - $totalCost;
        
        $this->update([
            'total_revenue' => $totalRevenue,
            'gross_profit' => $grossProfit,
            'roi_percentage' => $totalCost > 0 ? round(($grossProfit / $totalCost) * 100, 2) : 0,
        ]);
    }

    public function getProjectReports(): array
    {
        return [
            'project_summary' => [
                'name' => $this->name,
                'type' => $this->type,
                'location' => $this->location,
                'status' => $this->status,
                'development_phase' => $this->development_phase,
            ],
            'financial_summary' => $this->calculateProfitability(),
            'sales_summary' => $this->getSalesTracking(),
            'cost_summary' => $this->getCostTracking(),
            'development_status' => $this->getDevelopmentStatus(),
            'legal_approvals' => $this->getLegalApprovals(),
            'gallery' => $this->getGallery(),
        ];
    }
}
