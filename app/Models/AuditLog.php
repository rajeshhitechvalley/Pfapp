<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'data',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', $startDate, $endDate);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('created_at', '>=', Carbon::now()->subHours($hours));
    }

    // Accessors
    public function getFormattedDataAttribute(): string
    {
        return json_encode($this->data, JSON_PRETTY_PRINT);
    }

    public function getActionDescriptionAttribute(): string
    {
        $descriptions = [
            'configuration_created' => 'Configuration Created',
            'configuration_updated' => 'Configuration Updated',
            'configuration_deleted' => 'Configuration Deleted',
            'investment_setting_updated' => 'Investment Setting Updated',
            'profit_setting_updated' => 'Profit Setting Updated',
            'team_setting_updated' => 'Team Setting Updated',
            'wallet_setting_updated' => 'Wallet Setting Updated',
            'security_setting_updated' => 'Security Setting Updated',
            'system_setting_updated' => 'System Setting Updated',
            'investment_approved' => 'Investment Approved',
            'investment_rejected' => 'Investment Rejected',
            'user_status_toggled' => 'User Status Toggled',
            'user_verified' => 'User Verified',
            'user_role_updated' => 'User Role Updated',
            'team_status_toggled' => 'Team Status Toggled',
            'user_login' => 'User Login',
            'user_logout' => 'User Logout',
            'user_registered' => 'User Registered',
            'investment_created' => 'Investment Created',
            'investment_updated' => 'Investment Updated',
            'investment_cancelled' => 'Investment Cancelled',
            'profit_distributed' => 'Profit Distributed',
            'reinvestment_created' => 'Reinvestment Created',
            'sale_created' => 'Sale Created',
            'sale_updated' => 'Sale Updated',
            'project_created' => 'Project Created',
            'project_updated' => 'Project Updated',
            'team_created' => 'Team Created',
            'team_updated' => 'Team Updated',
        ];

        return $descriptions[$this->action] ?? $this->action;
    }

    public function getIpAddressAttribute(): string
    {
        return $this->attributes['ip_address'] ?? 'Unknown';
    }

    public function getUserAgentAttribute(): string
    {
        return $this->attributes['user_agent'] ?? 'Unknown';
    }

    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('Y-m-d H:i:s');
    }

    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    // Business Logic Methods
    public static function log($action, $data = [], $userId = null): self
    {
        return self::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'data' => $data,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public static function getUserActivity($userId, $limit = 50): array
    {
        return self::byUser($userId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'action_description' => $log->getActionDescriptionAttribute(),
                    'data' => $log->data,
                    'ip_address' => $log->getIpAddressAttribute(),
                    'user_agent' => $log->getUserAgentAttribute(),
                    'created_at' => $log->getFormattedCreatedAtAttribute(),
                    'time_ago' => $log->getTimeAgoAttribute(),
                ];
            })
            ->toArray();
    }

    public static function getSystemActivity($limit = 100): array
    {
        return self::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user->name ?? 'System',
                    'action' => $log->action,
                    'action_description' => $log->getActionDescriptionAttribute(),
                    'data' => $log->data,
                    'ip_address' => $log->getIpAddressAttribute(),
                    'user_agent' => $log->getUserAgentAttribute(),
                    'created_at' => $log->getFormattedCreatedAtAttribute(),
                    'time_ago' => $log->getTimeAgoAttribute(),
                ];
            })
            ->toArray();
    }

    public static function getActionStats($startDate, $endDate): array
    {
        return self::whereBetween('created_at', $startDate, $endDate)
            ->selectRaw('
                action,
                COUNT(*) as count,
                MAX(created_at) as last_occurrence
            ')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($stat) {
                return [
                    'action' => $stat->action,
                    'action_description' => (new self(['action' => $stat->action]))->getActionDescriptionAttribute(),
                    'count' => $stat->count,
                    'last_occurrence' => $stat->last_occurrence,
                ];
            })
            ->toArray();
    }

    public static function getUserStats($startDate, $endDate): array
    {
        return self::whereBetween('created_at', $startDate, $endDate)
            ->selectRaw('
                user_id,
                COUNT(*) as count,
                MAX(created_at) as last_activity
            ')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->with('user')
            ->get()
            ->map(function ($stat) {
                return [
                    'user_id' => $stat->user_id,
                    'user_name' => $stat->user->name ?? 'Unknown',
                    'count' => $stat->count,
                    'last_activity' => $stat->last_activity,
                ];
            })
            ->toArray();
    }

    public static function getSecurityEvents($startDate, $endDate): array
    {
        $securityActions = [
            'user_login',
            'user_logout',
            'user_status_toggled',
            'user_role_updated',
            'security_setting_updated',
        ];

        return self::whereBetween('created_at', $startDate, $endDate)
            ->whereIn('action', $securityActions)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user->name ?? 'System',
                    'action' => $log->action,
                    'action_description' => $log->getActionDescriptionAttribute(),
                    'data' => $log->data,
                    'ip_address' => $log->getIpAddressAttribute(),
                    'user_agent' => $log->getUserAgentAttribute(),
                    'created_at' => $log->getFormattedCreatedAtAttribute(),
                    'time_ago' => $log->getTimeAgoAttribute(),
                ];
            })
            ->toArray();
    }

    public static function getFailedLogins($startDate, $endDate): array
    {
        return self::whereBetween('created_at', $startDate, $endDate)
            ->where('action', 'user_login_failed')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user->name ?? 'Unknown',
                    'data' => $log->data,
                    'ip_address' => $log->getIpAddressAttribute(),
                    'user_agent' => $log->getUserAgentAttribute(),
                    'created_at' => $log->getFormattedCreatedAtAttribute(),
                    'time_ago' => $log->getTimeAgoAttribute(),
                ];
            })
            ->toArray();
    }

    public static function cleanupOldLogs($days = 90): int
    {
        return self::where('created_at', '<', Carbon::now()->subDays($days))
            ->delete();
    }

    public static function getLogSummary($startDate, $endDate): array
    {
        return [
            'total_logs' => self::whereBetween('created_at', $startDate, $endDate)->count(),
            'unique_users' => self::whereBetween('created_at', $startDate, $endDate)->distinct('user_id')->count('user_id'),
            'unique_actions' => self::whereBetween('created_at', $startDate, $endDate)->distinct('action')->count('action'),
            'top_actions' => self::getActionStats($startDate, $endDate),
            'top_users' => self::getUserStats($startDate, $endDate),
            'security_events' => self::getSecurityEvents($startDate, $endDate),
        ];
    }
}
