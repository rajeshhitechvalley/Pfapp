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
        'property_project_id',
        'hold_start_date',
        'hold_expiry_date',
        'hold_status',
        'hold_amount',
        'hold_type',
        'notes',
        'email_sent',
        'sms_sent',
        'released_by_user_id',
        'release_date',
        'release_reason',
        'auto_renewal',
        'renewal_count',
        'priority_level',
        'verification_code',
        'verification_code_expiry',
        'documents_required',
        'documents_submitted',
        'approval_status',
        'approved_by',
        'approved_at',
        'created_by',
        'updated_by',
        
        // REQ-PH-004 & REQ-PH-005: Eligibility tracking
        'team_value_limit_used', // Percentage of team value used
        'investment_limit_used', // Multiple of investment used
        'team_value_at_hold', // Team value at time of hold
        'investment_at_hold', // Investment amount at time of hold
        
        // REQ-PH-006: Hold validity and duration
        'original_expiry_date', // Original expiry before extensions
        'extension_count', // Number of times hold was extended
        'last_extension_date', // Last date hold was extended
        
        // REQ-PH-007: Hold lock rules
        'max_plots_per_user', // Configurable max plots per user
        'user_status_check', // User status at time of hold
        'outstanding_dues_check', // Outstanding dues check result
        'lock_rules_violated', // Whether any lock rules were violated
        
        // Communication tracking
        'notification_preferences', // JSON array of notification preferences
        'last_notification_sent', // When last notification was sent
        'notification_count', // Total notifications sent
        
        // Comparison and analytics
        'comparison_plot_ids', // JSON array of plots compared with
        'source_of_hold', // How user found this plot
        'conversion_probability', // AI-predicted conversion probability
        'hold_score', // Score based on user behavior
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
