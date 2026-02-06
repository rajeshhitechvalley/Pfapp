<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Investment;
use App\Models\Team;
use App\Models\Plot;
use App\Models\PropertyProject;
use App\Models\PlotHolding;
use App\Models\Transaction;
use App\Models\Notification;
use App\Models\Profit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        // REQ-UD-001: Dashboard Overview
        // REQ-UD-002: Quick Stats Display
        $stats = $this->getUserStats($user);
        
        // REQ-UD-003: View Available Projects
        $projects = $this->getAvailableProjects($user);
        
        // REQ-UD-004: View Available Plots
        $plots = $this->getAvailablePlots($user);
        
        // REQ-UD-006: Wallet Balance Display
        $walletData = $this->getWalletData($user);
        
        // REQ-UD-007: Investment Overview
        $investmentData = $this->getInvestmentData($user);
        
        // REQ-UD-008: Team Summary Display
        $teamData = $this->getTeamData($user);
        
        // REQ-UD-011: Recent Activities Feed
        $activities = $this->getRecentActivities($user);
        
        // REQ-UD-012: Notifications Center
        $notifications = $this->getNotifications($user);
        
        // REQ-UD-009: Investment Eligibility Indicators
        $eligibility = $this->getEligibilityIndicators($user);
        
        // REQ-UD-014: Dashboard Personalization
        $preferences = $this->getUserPreferences($user);

        return Inertia::render('UserDashboard', [
            'stats' => $stats,
            'projects' => $projects,
            'plots' => $plots,
            'wallet' => $walletData,
            'investment' => $investmentData,
            'team' => $teamData,
            'activities' => $activities,
            'notifications' => $notifications,
            'eligibility' => $eligibility,
            'preferences' => $preferences,
        ]);
    }

    public function getStats(Request $request): JsonResponse
    {
        $user = Auth::user();
        $stats = $this->getUserStats($user);
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getProjects(Request $request): JsonResponse
    {
        $user = Auth::user();
        $projects = $this->getAvailableProjects($user);
        
        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    public function getPlots(Request $request): JsonResponse
    {
        $user = Auth::user();
        $plots = $this->getAvailablePlots($user);
        
        return response()->json([
            'success' => true,
            'data' => $plots
        ]);
    }

    // REQ-UD-005: Plot Comparison Interface
    public function comparePlots(Request $request): JsonResponse
    {
        $request->validate([
            'plot_ids' => 'required|array|min:2|max:4',
            'plot_ids.*' => 'exists:plots,id'
        ]);

        $user = Auth::user();
        $plotIds = $request->plot_ids;
        
        $plots = Plot::with(['project'])
            ->whereIn('id', $plotIds)
            ->get()
            ->map(function ($plot) use ($user) {
                return [
                    'id' => $plot->id,
                    'plot_number' => $plot->plot_number,
                    'project_name' => $plot->project->name,
                    'area' => $plot->area,
                    'area_unit' => $plot->area_unit,
                    'price' => $plot->price,
                    'plot_type' => $plot->plot_type,
                    'facing' => $plot->facing ?? 'N/A',
                    'road_width' => $plot->road_width,
                    'corner_plot' => $plot->corner_plot,
                    'double_road' => $plot->double_road,
                    'features' => $plot->features,
                    'nearby_amenities' => $plot->nearby_amenities ?? [],
                    'utilities' => $plot->utilities ?? [],
                    'status' => $plot->status,
                    'is_available' => $plot->status === 'available' && !$plot->is_held,
                    'can_hold' => $plot->status === 'available' && !$plot->is_held,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $plots
        ]);
    }

    // REQ-UD-014: Dashboard Personalization
    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'widgets' => 'required|array',
            'theme' => 'required|string|in:light,dark,auto',
            'layout' => 'required|string|in:grid,list,compact',
        ]);

        $user = Auth::user();
        
        $user->update([
            'dashboard_preferences' => [
                'widgets' => $request->widgets,
                'theme' => $request->theme,
                'layout' => $request->layout,
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully'
        ]);
    }

    private function getUserStats(User $user): array
    {
        // REQ-UD-002: Quick Stats Display
        $totalInvested = Investment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->sum('amount');

        $totalProfit = DB::table('profits')
            ->where('user_id', $user->id)
            ->sum('investor_share');

        $wallet = Wallet::where('user_id', $user->id)->first();
        $walletBalance = $wallet ? $wallet->balance : 0;

        $teamSize = Team::where('team_leader_id', $user->id)->count();

        $teamValue = DB::table('investments')
            ->join('team_members', 'investments.user_id', '=', 'team_members.user_id')
            ->join('teams', 'team_members.team_id', '=', 'teams.id')
            ->where('teams.team_leader_id', $user->id)
            ->sum('investments.amount');

        $availableProjects = PropertyProject::where('status', 'Ready for Sale')
            ->where('approval_status', 'approved')
            ->count();

        $plotsHeld = PlotHolding::where('user_id', $user->id)
            ->where('hold_status', 'active')
            ->count();

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $unreadNotifications = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return [
            'total_invested' => $totalInvested,
            'total_profit' => $totalProfit,
            'wallet_balance' => $walletBalance,
            'team_size' => $teamSize,
            'team_value' => $teamValue,
            'available_projects' => $availableProjects,
            'plots_held' => $plotsHeld,
            'recent_transactions' => $recentTransactions,
            'unread_notifications' => $unreadNotifications,
        ];
    }

    private function getAvailableProjects(User $user): array
    {
        // REQ-UD-003: View Available Projects
        $projects = PropertyProject::with(['plots'])
            ->where('status', 'Ready for Sale')
            ->where('approval_status', 'approved')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($project) use ($user) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'type' => $project->type,
                    'location' => $project->location,
                    'total_plots' => $project->total_plots,
                    'available_plots' => $project->available_plots,
                    'price_per_plot' => $project->price_per_plot,
                    'image' => $project->featured_image,
                    'status' => $project->status,
                    'progress' => $project->total_plots > 0 
                        ? (($project->total_plots - $project->available_plots) / $project->total_plots) * 100 
                        : 0,
                    'eligible' => $this->checkProjectEligibility($user, $project),
                ];
            });

        return $projects->toArray();
    }

    private function getAvailablePlots(User $user): array
    {
        // REQ-UD-004: View Available Plots
        $plots = Plot::with(['project'])
            ->where('status', 'available')
            ->where('is_held', false)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($plot) use ($user) {
                return [
                    'id' => $plot->id,
                    'plot_number' => $plot->plot_number,
                    'project_name' => $plot->project->name,
                    'area' => $plot->area,
                    'area_unit' => $plot->area_unit,
                    'price' => $plot->price,
                    'plot_type' => $plot->plot_type,
                    'facing' => $plot->facing ?? 'N/A',
                    'status' => $plot->status,
                    'is_held' => $plot->is_held,
                    'is_corner' => $plot->corner_plot,
                    'is_double_road' => $plot->double_road,
                    'features' => $plot->features,
                    'eligible' => $this->checkPlotEligibility($user, $plot),
                ];
            });

        return $plots->toArray();
    }

    private function getWalletData(User $user): array
    {
        // REQ-UD-006: Wallet Balance Display
        $wallet = Wallet::where('user_id', $user->id)->first();
        
        if (!$wallet) {
            return [
                'balance' => 0,
                'total_deposited' => 0,
                'total_withdrawn' => 0,
                'last_transaction' => null,
            ];
        }

        $totalDeposited = Transaction::where('user_id', $user->id)
            ->where('type', 'deposit')
            ->where('status', 'completed')
            ->sum('amount');

        $totalWithdrawn = Transaction::where('user_id', $user->id)
            ->where('type', 'withdrawal')
            ->where('status', 'completed')
            ->sum('amount');

        $lastTransaction = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        return [
            'balance' => $wallet->balance,
            'total_deposited' => $totalDeposited,
            'total_withdrawn' => $totalWithdrawn,
            'last_transaction' => $lastTransaction ? [
                'type' => $lastTransaction->type,
                'amount' => $lastTransaction->amount,
                'description' => $lastTransaction->description,
                'created_at' => $lastTransaction->created_at,
            ] : null,
        ];
    }

    private function getInvestmentData(User $user): array
    {
        // REQ-UD-007: Investment Overview
        $investments = Investment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->get();

        $totalInvested = $investments->sum('amount');
        $activeCount = $investments->where('status', 'active')->count();
        
        // Project distribution
        $projectDistribution = $investments
            ->groupBy('property_project_id')
            ->map(function ($group) {
                return [
                    'project_id' => $group->first()->property_project_id,
                    'amount' => $group->sum('amount'),
                    'count' => $group->count(),
                ];
            })
            ->values();

        $latestTransaction = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        $expectedReturns = $investments->sum(function ($investment) {
            return $investment->amount * ($investment->expected_return / 100);
        });

        return [
            'total_invested' => $totalInvested,
            'active_count' => $activeCount,
            'project_distribution' => $projectDistribution,
            'latest_transaction' => $latestTransaction,
            'expected_returns' => $expectedReturns,
            'roi_percentage' => $totalInvested > 0 ? ($expectedReturns / $totalInvested) * 100 : 0,
        ];
    }

    private function getTeamData(User $user): array
    {
        // REQ-UD-008: Team Summary Display
        $teamMembers = Team::where('team_leader_id', $user->id)
            ->with('member')
            ->get();

        $teamSize = $teamMembers->count();
        $teamValue = $teamMembers->sum(function ($member) {
            return $member->member->total_investment ?? 0;
        });

        $referralCount = User::where('referred_by', $user->id)->count();
        $referralLink = route('register', ['ref' => $user->referral_code]);

        return [
            'team_size' => $teamSize,
            'team_value' => $teamValue,
            'referral_count' => $referralCount,
            'referral_link' => $referralLink,
            'progress_percentage' => ($teamSize / 20) * 100,
            'members' => $teamMembers->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->member->name,
                    'email' => $member->member->email,
                    'role' => $member->role,
                    'status' => $member->member->status,
                    'avatar' => $member->member->avatar,
                ];
            }),
        ];
    }

    private function getRecentActivities(User $user): array
    {
        // REQ-UD-011: Recent Activities Feed
        $activities = collect();

        // Recent investments
        $investments = Investment::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($investments as $investment) {
            $activities->push([
                'type' => 'investment',
                'title' => 'New Investment',
                'description' => "Invested ₹{$investment->amount} in {$investment->propertyProject->name}",
                'amount' => $investment->amount,
                'created_at' => $investment->created_at,
                'icon' => 'trending-up',
                'color' => 'blue',
            ]);
        }

        // Recent plot holdings
        $holdings = PlotHolding::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($holdings as $holding) {
            $activities->push([
                'type' => 'plot_hold',
                'title' => 'Plot Held',
                'description' => "Held plot {$holding->plot->plot_number} in {$holding->plot->project->name}",
                'amount' => $holding->hold_amount,
                'created_at' => $holding->created_at,
                'icon' => 'map-pin',
                'color' => 'green',
            ]);
        }

        // Recent transactions
        $transactions = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($transactions as $transaction) {
            $activities->push([
                'type' => 'transaction',
                'title' => ucfirst($transaction->type),
                'description' => $transaction->description,
                'amount' => $transaction->amount,
                'created_at' => $transaction->created_at,
                'icon' => $transaction->type === 'deposit' ? 'arrow-down' : 'arrow-up',
                'color' => $transaction->type === 'deposit' ? 'green' : 'red',
            ]);
        }

        return $activities
            ->sortByDesc('created_at')
            ->take(15)
            ->values()
            ->toArray();
    }

    private function getNotifications(User $user): array
    {
        // REQ-UD-012: Notifications Center
        return Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'created_at' => $notification->created_at,
                    'read' => $notification->read,
                ];
            })
            ->toArray();
    }

    private function getEligibilityIndicators(User $user): array
    {
        // REQ-UD-009: Investment Eligibility Indicators
        $wallet = Wallet::where('user_id', $user->id)->first();
        $walletBalance = $wallet ? $wallet->balance : 0;
        
        $teamValue = DB::table('investments')
            ->join('team_members', 'investments.user_id', '=', 'team_members.user_id')
            ->join('teams', 'team_members.team_id', '=', 'teams.id')
            ->where('teams.team_leader_id', $user->id)
            ->sum('investments.amount');

        $totalInvestment = Investment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->sum('amount');

        return [
            'account_status' => $user->status === 'active' ? 'active' : 'inactive',
            'wallet_sufficient' => $walletBalance >= 10000,
            'hold_limit_status' => $this->getHoldLimitStatus($user),
            'team_value' => $teamValue,
            'investment_amount' => $totalInvestment,
            'max_hold_amount' => min($teamValue * 0.5, $totalInvestment * 10),
            'used_hold_amount' => $this->getUsedHoldAmount($user),
        ];
    }

    private function getUserPreferences(User $user): array
    {
        // REQ-UD-014: Dashboard Personalization
        return $user->dashboard_preferences ?? [
            'widgets' => ['stats', 'projects', 'wallet', 'team'],
            'theme' => 'light',
            'layout' => 'grid',
        ];
    }

    private function checkProjectEligibility(User $user, PropertyProject $project): bool
    {
        if ($user->status !== 'active') {
            return false;
        }

        $wallet = Wallet::where('user_id', $user->id)->first();
        if (!$wallet || $wallet->balance < $project->price_per_plot) {
            return false;
        }

        return true;
    }

    private function checkPlotEligibility(User $user, Plot $plot): bool
    {
        if ($user->status !== 'active') {
            return false;
        }

        $wallet = Wallet::where('user_id', $user->id)->first();
        if (!$wallet || $wallet->balance < $plot->price) {
            return false;
        }

        $currentHolds = PlotHolding::where('user_id', $user->id)
            ->where('hold_status', 'active')
            ->count();

        if ($currentHolds >= 5) {
            return false;
        }

        return true;
    }

    private function getHoldLimitStatus(User $user): string
    {
        $teamValue = DB::table('investments')
            ->join('team_members', 'investments.user_id', '=', 'team_members.user_id')
            ->join('teams', 'team_members.team_id', '=', 'teams.id')
            ->where('teams.team_leader_id', $user->id)
            ->sum('investments.amount');

        $totalInvestment = Investment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->sum('amount');

        $maxHoldAmount = min($teamValue * 0.5, $totalInvestment * 10);
        $usedHoldAmount = $this->getUsedHoldAmount($user);

        $percentage = $maxHoldAmount > 0 ? ($usedHoldAmount / $maxHoldAmount) * 100 : 0;

        if ($percentage >= 90) {
            return 'critical';
        } elseif ($percentage >= 70) {
            return 'warning';
        } else {
            return 'good';
        }
    }

    private function getUsedHoldAmount(User $user): float
    {
        return PlotHolding::where('user_id', $user->id)
            ->where('hold_status', 'active')
            ->sum('hold_amount');
    }
}
