<?php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use App\Models\User;
use App\Models\Team;
use App\Models\Investment;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminConfigurationController extends Controller
{
    public function index(): Response
    {
        $configurations = AdminConfiguration::active()
            ->orderBy('category')
            ->orderBy('key')
            ->get()
            ->groupBy('category');

        return Inertia::render('Admin/Configuration/Index', [
            'configurations' => $configurations,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Configuration/Create');
    }

    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:admin_configurations,key',
            'value' => 'required|string',
            'type' => 'required|in:string,boolean,number,currency,percentage,integer',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $configuration = AdminConfiguration::create([
            'key' => $validated['key'],
            'value' => $validated['value'],
            'type' => $validated['type'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        $this->logAudit('configuration_created', [
            'configuration_id' => $configuration->id,
            'key' => $configuration->key,
            'value' => $configuration->value,
        ]);

        return redirect()->route('admin.configuration.index')
            ->with('success', 'Configuration created successfully.');
    }

    public function edit(AdminConfiguration $configuration): Response
    {
        return Inertia::render('Admin/Configuration/Edit', [
            'configuration' => $configuration,
        ]);
    }

    public function update(Request $request, AdminConfiguration $configuration): Response
    {
        $validated = $request->validate([
            'value' => 'required|string',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $oldValue = $configuration->value;
        
        $configuration->update([
            'value' => $validated['value'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
            'updated_by' => Auth::id(),
        ]);

        $this->logAudit('configuration_updated', [
            'configuration_id' => $configuration->id,
            'key' => $configuration->key,
            'old_value' => $oldValue,
            'new_value' => $configuration->value,
        ]);

        return redirect()->route('admin.configuration.index')
            ->with('success', 'Configuration updated successfully.');
    }

    public function destroy(AdminConfiguration $configuration): Response
    {
        $this->logAudit('configuration_deleted', [
            'configuration_id' => $configuration->id,
            'key' => $configuration->key,
            'value' => $configuration->value,
        ]);

        $configuration->delete();

        return redirect()->route('admin.configuration.index')
            ->with('success', 'Configuration deleted successfully.');
    }

    public function investmentSettings(): Response
    {
        $settings = AdminConfiguration::getInvestmentSettings();

        return Inertia::render('Admin/Configuration/Investment', [
            'settings' => $settings,
        ]);
    }

    public function updateInvestmentSettings(Request $request): Response
    {
        $validated = $request->validate([
            'minimum_investment' => 'required|numeric|min:0',
            'maximum_investment' => 'required|numeric|min:0',
            'investment_approval_required' => 'boolean',
            'auto_approve_investments' => 'boolean',
            'investment_fee_percentage' => 'required|numeric|min:0|max:100',
            'investment_fee_fixed' => 'required|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            $oldValue = AdminConfiguration::getValue($key);
            
            AdminConfiguration::setValue($key, $value, $this->getSettingType($key), 'investment');
            
            if ($oldValue != $value) {
                $this->logAudit('investment_setting_updated', [
                    'key' => $key,
                    'old_value' => $oldValue,
                    'new_value' => $value,
                ]);
            }
        }

        return redirect()->route('admin.configuration.investment')
            ->with('success', 'Investment settings updated successfully.');
    }

    public function profitSettings(): Response
    {
        $settings = AdminConfiguration::getProfitSettings();

        return Inertia::render('Admin/Configuration/Profit', [
            'settings' => $settings,
        ]);
    }

    public function updateProfitSettings(Request $request): Response
    {
        $validated = $request->validate([
            'company_profit_percentage' => 'required|numeric|min:0|max:100',
            'team_bonus_percentage' => 'required|numeric|min:0|max:100',
            'minimum_profit_amount' => 'required|numeric|min:0',
            'profit_distribution_frequency' => 'required|in:daily,weekly,monthly,quarterly',
            'auto_distribute_profits' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            $oldValue = AdminConfiguration::getValue($key);
            
            AdminConfiguration::setValue($key, $value, $this->getSettingType($key), 'profit');
            
            if ($oldValue != $value) {
                $this->logAudit('profit_setting_updated', [
                    'key' => $key,
                    'old_value' => $oldValue,
                    'new_value' => $value,
                ]);
            }
        }

        return redirect()->route('admin.configuration.profit')
            ->with('success', 'Profit settings updated successfully.');
    }

    public function teamSettings(): Response
    {
        $settings = AdminConfiguration::getTeamSettings();

        return Inertia::render('Admin/Configuration/Team', [
            'settings' => $settings,
        ]);
    }

    public function updateTeamSettings(Request $request): Response
    {
        $validated = $request->validate([
            'minimum_team_size' => 'required|integer|min:1',
            'maximum_team_size' => 'required|integer|min:1',
            'team_approval_required' => 'boolean',
            'team_leader_bonus_percentage' => 'required|numeric|min:0|max:100',
            'team_member_bonus_percentage' => 'required|numeric|min:0|max:100',
            'team_minimum_investment' => 'required|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            $oldValue = AdminConfiguration::getValue($key);
            
            AdminConfiguration::setValue($key, $value, $this->getSettingType($key), 'team');
            
            if ($oldValue != $value) {
                $this->logAudit('team_setting_updated', [
                    'key' => $key,
                    'old_value' => $oldValue,
                    'new_value' => $value,
                ]);
            }
        }

        return redirect()->route('admin.configuration.team')
            ->with('success', 'Team settings updated successfully.');
    }

    public function walletSettings(): Response
    {
        $settings = AdminConfiguration::getWalletSettings();

        return Inertia::render('Admin/Configuration/Wallet', [
            'settings' => $settings,
        ]);
    }

    public function updateWalletSettings(Request $request): Response
    {
        $validated = $request->validate([
            'minimum_wallet_balance' => 'required|numeric|min:0',
            'maximum_wallet_balance' => 'required|numeric|min:0',
            'wallet_transaction_fee' => 'required|numeric|min:0',
            'withdrawal_fee_percentage' => 'required|numeric|min:0|max:100',
            'withdrawal_fee_fixed' => 'required|numeric|min:0',
            'daily_withdrawal_limit' => 'required|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            $oldValue = AdminConfiguration::getValue($key);
            
            AdminConfiguration::setValue($key, $value, $this->getSettingType($key), 'wallet');
            
            if ($oldValue != $value) {
                $this->logAudit('wallet_setting_updated', [
                    'key' => $key,
                    'old_value' => $oldValue,
                    'new_value' => $value,
                ]);
            }
        }

        return redirect()->route('admin.configuration.wallet')
            ->with('success', 'Wallet settings updated successfully.');
    }

    public function securitySettings(): Response
    {
        $settings = AdminConfiguration::getSecuritySettings();

        return Inertia::render('Admin/Configuration/Security', [
            'settings' => $settings,
        ]);
    }

    public function updateSecuritySettings(Request $request): Response
    {
        $validated = $request->validate([
            'require_kyc_verification' => 'boolean',
            'require_email_verification' => 'boolean',
            'require_phone_verification' => 'boolean',
            'max_login_attempts' => 'required|integer|min:1|max:10',
            'session_timeout_minutes' => 'required|integer|min:5|max:1440',
            'password_min_length' => 'required|integer|min:6|max:50',
            'require_2fa' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            $oldValue = AdminConfiguration::getValue($key);
            
            AdminConfiguration::setValue($key, $value, $this->getSettingType($key), 'security');
            
            if ($oldValue != $value) {
                $this->logAudit('security_setting_updated', [
                    'key' => $key,
                    'old_value' => $oldValue,
                    'new_value' => $value,
                ]);
            }
        }

        return redirect()->route('admin.configuration.security')
            ->with('success', 'Security settings updated successfully.');
    }

    public function systemSettings(): Response
    {
        $settings = AdminConfiguration::getSystemSettings();

        return Inertia::render('Admin/Configuration/System', [
            'settings' => $settings,
        ]);
    }

    public function updateSystemSettings(Request $request): Response
    {
        $validated = $request->validate([
            'system_maintenance_mode' => 'boolean',
            'allow_new_registrations' => 'boolean',
            'allow_new_investments' => 'boolean',
            'allow_new_teams' => 'boolean',
            'system_timezone' => 'required|string|max:50',
            'default_currency' => 'required|string|max:3',
            'date_format' => 'required|string|max:20',
            'time_format' => 'required|string|max:20',
        ]);

        foreach ($validated as $key => $value) {
            $oldValue = AdminConfiguration::getValue($key);
            
            AdminConfiguration::setValue($key, $value, $this->getSettingType($key), 'system');
            
            if ($oldValue != $value) {
                $this->logAudit('system_setting_updated', [
                    'key' => $key,
                    'old_value' => $oldValue,
                    'new_value' => $value,
                ]);
            }
        }

        return redirect()->route('admin.configuration.system')
            ->with('success', 'System settings updated successfully.');
    }

    public function investmentApprovals(): Response
    {
        $investments = Investment::with(['user', 'propertyProject', 'plot'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/InvestmentApprovals', [
            'investments' => $investments->items(),
            'pagination' => [
                'current_page' => $investments->currentPage(),
                'last_page' => $investments->lastPage(),
                'per_page' => $investments->perPage(),
                'total' => $investments->total(),
                'from' => $investments->firstItem(),
                'to' => $investments->lastItem(),
            ]
        ]);
    }

    public function approveInvestment(Investment $investment): Response
    {
        if ($investment->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Investment cannot be approved.');
        }

        $investment->update([
            'status' => 'active',
            'approval_date' => now(),
            'approved_by' => Auth::id(),
        ]);

        $this->logAudit('investment_approved', [
            'investment_id' => $investment->id,
            'user_id' => $investment->user_id,
            'amount' => $investment->amount,
        ]);

        return redirect()->back()
            ->with('success', 'Investment approved successfully.');
    }

    public function rejectInvestment(Request $request, Investment $investment): Response
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($investment->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Investment cannot be rejected.');
        }

        $investment->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'approved_by' => Auth::id(),
        ]);

        $this->logAudit('investment_rejected', [
            'investment_id' => $investment->id,
            'user_id' => $investment->user_id,
            'amount' => $investment->amount,
            'reason' => $validated['rejection_reason'],
        ]);

        return redirect()->back()
            ->with('success', 'Investment rejected successfully.');
    }

    public function bulkApproveInvestments(Request $request): Response
    {
        $validated = $request->validate([
            'investment_ids' => 'required|array',
            'investment_ids.*' => 'exists:investments,id',
        ]);

        $approvedCount = 0;
        $failedCount = 0;

        foreach ($validated['investment_ids'] as $investmentId) {
            $investment = Investment::find($investmentId);
            
            if ($investment && $investment->status === 'pending') {
                $investment->update([
                    'status' => 'active',
                    'approval_date' => now(),
                    'approved_by' => Auth::id(),
                ]);
                
                $this->logAudit('investment_approved', [
                    'investment_id' => $investment->id,
                    'user_id' => $investment->user_id,
                    'amount' => $investment->amount,
                ]);
                
                $approvedCount++;
            } else {
                $failedCount++;
            }
        }

        return redirect()->back()
            ->with('success', "Successfully approved {$approvedCount} investments. Failed: {$failedCount}");
    }

    public function userManagement(): Response
    {
        $users = User::with(['wallet', 'ledTeam', 'teamMemberships'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/UserManagement', [
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ]
        ]);
    }

    public function toggleUserStatus(User $user): Response
    {
        $user->update([
            'is_active' => !$user->is_active,
            'updated_by' => Auth::id(),
        ]);

        $this->logAudit('user_status_toggled', [
            'user_id' => $user->id,
            'old_status' => !$user->is_active,
            'new_status' => $user->is_active,
        ]);

        return redirect()->back()
            ->with('success', 'User status updated successfully.');
    }

    public function verifyUser(User $user): Response
    {
        $user->update([
            'kyc_verified' => true,
            'kyc_verified_at' => now(),
            'kyc_verified_by' => Auth::id(),
        ]);

        $this->logAudit('user_verified', [
            'user_id' => $user->id,
        ]);

        return redirect()->back()
            ->with('success', 'User verified successfully.');
    }

    public function teamManagement(): Response
    {
        $teams = Team::with(['teamLeader', 'teamMembers.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/TeamManagement', [
            'teams' => $teams->items(),
            'pagination' => [
                'current_page' => $teams->currentPage(),
                'last_page' => $teams->lastPage(),
                'per_page' => $teams->perPage(),
                'total' => $teams->total(),
                'from' => $teams->firstItem(),
                'to' => $teams->lastItem(),
            ]
        ]);
    }

    public function toggleTeamStatus(Team $team): Response
    {
        $team->update([
            'status' => $team->status === 'active' ? 'inactive' : 'active',
            'updated_by' => Auth::id(),
        ]);

        $this->logAudit('team_status_toggled', [
            'team_id' => $team->id,
            'old_status' => $team->status === 'active' ? 'inactive' : 'active',
            'new_status' => $team->status,
        ]);

        return redirect()->back()
            ->with('success', 'Team status updated successfully.');
    }

    public function auditLogs(): Response
    {
        $logs = AuditLog::with(['user'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ]
        ]);
    }

    public function accessControl(): Response
    {
        $users = User::with(['roles', 'permissions'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/AccessControl', [
            'users' => $users,
        ]);
    }

    public function updateUserRole(Request $request, User $user): Response
    {
        $validated = $request->validate([
            'role' => 'required|string|in:admin,manager,user',
        ]);

        $oldRole = $user->role;
        
        $user->update([
            'role' => $validated['role'],
            'updated_by' => Auth::id(),
        ]);

        $this->logAudit('user_role_updated', [
            'user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $validated['role'],
        ]);

        return redirect()->back()
            ->with('success', 'User role updated successfully.');
    }

    // Helper Methods
    private function getSettingType(string $key): string
    {
        $typeMap = [
            'minimum_investment' => 'currency',
            'maximum_investment' => 'currency',
            'investment_approval_required' => 'boolean',
            'auto_approve_investments' => 'boolean',
            'investment_fee_percentage' => 'percentage',
            'investment_fee_fixed' => 'currency',
            'company_profit_percentage' => 'percentage',
            'team_bonus_percentage' => 'percentage',
            'minimum_profit_amount' => 'currency',
            'profit_distribution_frequency' => 'string',
            'auto_distribute_profits' => 'boolean',
            'minimum_team_size' => 'integer',
            'maximum_team_size' => 'integer',
            'team_approval_required' => 'boolean',
            'team_leader_bonus_percentage' => 'percentage',
            'team_member_bonus_percentage' => 'percentage',
            'team_minimum_investment' => 'currency',
            'minimum_wallet_balance' => 'currency',
            'maximum_wallet_balance' => 'currency',
            'wallet_transaction_fee' => 'currency',
            'withdrawal_fee_percentage' => 'percentage',
            'withdrawal_fee_fixed' => 'currency',
            'daily_withdrawal_limit' => 'currency',
            'require_kyc_verification' => 'boolean',
            'require_email_verification' => 'boolean',
            'require_phone_verification' => 'boolean',
            'max_login_attempts' => 'integer',
            'session_timeout_minutes' => 'integer',
            'password_min_length' => 'integer',
            'require_2fa' => 'boolean',
            'system_maintenance_mode' => 'boolean',
            'allow_new_registrations' => 'boolean',
            'allow_new_investments' => 'boolean',
            'allow_new_teams' => 'boolean',
            'system_timezone' => 'string',
            'default_currency' => 'string',
            'date_format' => 'string',
            'time_format' => 'string',
        ];

        return $typeMap[$key] ?? 'string';
    }

    private function logAudit(string $action, array $data = []): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'data' => json_encode($data),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
