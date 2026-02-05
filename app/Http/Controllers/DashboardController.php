<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Investment;
use App\Models\Team;
use App\Models\Plot;
use App\Models\PropertyProject;
use App\Models\Profit;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get user's wallet
        $wallet = $user->wallet;
        
        // Get user's investments
        $investments = $user->investments()
            ->with(['property', 'plot'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        // Get user's team
        $team = $user->ledTeam;
        $teamMembers = $team ? $team->teamMembers()->with('user')->get() : collect([]);
        
        // Get available projects and plots
        $availableProjects = PropertyProject::where('status', 'active')
            ->withCount('plots')
            ->take(6)
            ->get();
            
        $availablePlots = Plot::where('status', 'available')
            ->with('property')
            ->take(10)
            ->get();
        
        // Get user's profits
        $profits = $user->profits()
            ->with(['sale.plot.property', 'investment'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        // Calculate statistics
        $stats = $this->calculateUserStats($user);
        
        // Get eligibility indicators
        $eligibility = $this->getEligibilityIndicators($user);
        
        // Get plot comparison data
        $plotComparison = $this->getPlotComparison($user);
        
        // Get profit and return summary
        $profitSummary = $this->getProfitReturnSummary($user);

        return Inertia::render('Dashboard/Index', [
            'user' => $user,
            'wallet' => $wallet,
            'investments' => $investments,
            'team' => $team,
            'teamMembers' => $teamMembers,
            'availableProjects' => $availableProjects,
            'availablePlots' => $availablePlots,
            'profits' => $profits,
            'stats' => $stats,
            'eligibility' => $eligibility,
            'plotComparison' => $plotComparison,
            'profitSummary' => $profitSummary,
        ]);
    }

    public function getWalletDetails(): Response
    {
        $user = Auth::user();
        $wallet = $user->wallet;
        
        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();
        
        $transactionSummary = $this->getTransactionSummary($wallet);
        
        return Inertia::render('Dashboard/Wallet', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'transactionSummary' => $transactionSummary,
        ]);
    }

    public function getInvestments(): Response
    {
        $user = Auth::user();
        
        $investments = $user->investments()
            ->with(['property', 'plot', 'profit'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $investmentStats = $this->getInvestmentStats($user);
        $investmentPerformance = $this->getInvestmentPerformance($user);
        
        return Inertia::render('Dashboard/Investments', [
            'investments' => $investments->items(),
            'pagination' => [
                'current_page' => $investments->currentPage(),
                'last_page' => $investments->lastPage(),
                'per_page' => $investments->perPage(),
                'total' => $investments->total(),
                'from' => $investments->firstItem(),
                'to' => $investments->lastItem(),
            ],
            'investmentStats' => $investmentStats,
            'investmentPerformance' => $investmentPerformance,
        ]);
    }

    public function getTeam(): Response
    {
        $user = Auth::user();
        
        $team = $user->ledTeam;
        $teamMembers = $team ? $team->teamMembers()->with('user')->get() : collect([]);
        
        $teamStats = $this->getTeamStats($team);
        $teamPerformance = $this->getTeamPerformance($team);
        
        return Inertia::render('Dashboard/Team', [
            'team' => $team,
            'teamMembers' => $teamMembers,
            'teamStats' => $teamStats,
            'teamPerformance' => $teamPerformance,
        ]);
    }

    public function getProjects(): Response
    {
        $user = Auth::user();
        
        $availableProjects = PropertyProject::where('status', 'active')
            ->with(['plots', 'sales', 'investments'])
            ->orderBy('created_at', 'desc')
            ->paginate(9);
        
        $projectStats = $this->getProjectStats($user);
        $recommendedProjects = $this->getRecommendedProjects($user);
        
        return Inertia::render('Dashboard/Projects', [
            'projects' => $availableProjects->items(),
            'pagination' => [
                'current_page' => $availableProjects->currentPage(),
                'last_page' => $availableProjects->lastPage(),
                'per_page' => $availableProjects->perPage(),
                'total' => $availableProjects->total(),
                'from' => $availableProjects->firstItem(),
                'to' => $availableProjects->lastItem(),
            ],
            'projectStats' => $projectStats,
            'recommendedProjects' => $recommendedProjects,
        ]);
    }

    public function getPlots(): Response
    {
        $user = Auth::user();
        
        $plots = Plot::where('status', 'available')
            ->with(['property', 'sales'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);
        
        $plotComparison = $this->getPlotComparison($user);
        $plotStats = $this->getPlotStats($user);
        
        return Inertia::render('Dashboard/Plots', [
            'plots' => $plots->items(),
            'pagination' => [
                'current_page' => $plots->currentPage(),
                'last_page' => $plots->lastPage(),
                'per_page' => $plots->perPage(),
                'total' => $plots->total(),
                'from' => $plots->firstItem(),
                'to' => $plots->lastItem(),
            ],
            'plotComparison' => $plotComparison,
            'plotStats' => $plotStats,
        ]);
    }

    public function getProfits(): Response
    {
        $user = Auth::user();
        
        $profits = $user->profits()
            ->with(['sale.plot.property', 'investment'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $profitSummary = $this->getProfitReturnSummary($user);
        $profitTrends = $this->getProfitTrends($user);
        
        return Inertia::render('Dashboard/Profits', [
            'profits' => $profits->items(),
            'pagination' => [
                'current_page' => $profits->currentPage(),
                'last_page' => $profits->lastPage(),
                'per_page' => $profits->perPage(),
                'total' => $profits->total(),
                'from' => $profits->firstItem(),
                'to' => $profits->lastItem(),
            ],
            'profitSummary' => $profitSummary,
            'profitTrends' => $profitTrends,
        ]);
    }

    public function getProfile(): Response
    {
        $user = Auth::user();
        
        $userStats = $this->calculateUserStats($user);
        $recentActivity = $this->getRecentActivity($user);
        
        return Inertia::render('Dashboard/Profile', [
            'user' => $user,
            'userStats' => $userStats,
            'recentActivity' => $recentActivity,
        ]);
    }

    // Helper Methods
    private function calculateUserStats(User $user): array
    {
        $totalInvested = $user->investments()->sum('amount');
        $totalReturns = $user->profits()->sum('investor_share');
        $activeInvestments = $user->investments()->where('status', 'active')->count();
        $completedInvestments = $user->investments()->where('status', 'completed')->count();
        
        return [
            'total_invested' => $totalInvested,
            'total_returns' => $totalReturns,
            'net_profit' => $totalReturns - $totalInvested,
            'active_investments' => $activeInvestments,
            'completed_investments' => $completedInvestments,
            'roi_percentage' => $totalInvested > 0 ? round(($totalReturns / $totalInvested) * 100, 2) : 0,
            'investment_count' => $user->investments()->count(),
        ];
    }

    private function getEligibilityIndicators(User $user): array
    {
        $wallet = $user->wallet;
        $team = $user->ledTeam;
        $hasActiveInvestments = $user->investments()->where('status', 'active')->exists();
        $isKycVerified = $user->kyc_verified;
        $isTeamActive = $team && $team->status === 'active';
        $teamValue = $team ? $team->teamMembers()->sum('wallet.balance') : 0;
        
        return [
            'can_invest' => $wallet && $wallet->balance > 0 && $isKycVerified,
            'has_active_investments' => $hasActiveInvestments,
            'kyc_verified' => $isKycVerified,
            'team_active' => $isTeamActive,
            'team_value_met' => $teamValue >= 10000, // Minimum team value requirement
            'wallet_balance' => $wallet ? $wallet->balance : 0,
            'min_investment_met' => $wallet && $wallet->balance >= 500, // Minimum investment amount
        ];
    }

    private function getPlotComparison(User $user): array
    {
        $userPlots = $user->investments()
            ->whereHas('plot')
            ->with('plot')
            ->get()
            ->pluck('plot');
        
        $avgPlotPrice = $userPlots->avg('price') ?? 0;
        $userAvgPrice = $userPlots->avg('pivot.price') ?? 0;
        
        $marketPlots = Plot::where('status', 'available')
            ->take(100)
            ->get();
        
        $marketAvgPrice = $marketPlots->avg('price') ?? 0;
        
        return [
            'user_plots_count' => $userPlots->count(),
            'user_avg_price' => $userAvgPrice,
            'market_avg_price' => $marketAvgPrice,
            'price_difference' => $marketAvgPrice - $userAvgPrice,
            'price_difference_percentage' => $marketAvgPrice > 0 ? round((($marketAvgPrice - $userAvgPrice) / $marketAvgPrice) * 100, 2) : 0,
        ];
    }

    private function getProfitReturnSummary(User $user): array
    {
        $profits = $user->profits()
            ->selectRaw('
                SUM(investor_share) as total_investor_profits,
                SUM(company_share) as total_company_profits,
                COUNT(*) as total_profits,
                AVG(investor_share) as avg_profit,
                MAX(investor_share) as max_profit
            ')
            ->first();
        
        $totalInvested = $user->investments()->sum('amount');
        
        return [
            'total_investor_profits' => $profits->total_investor_profits ?? 0,
            'total_company_profits' => $profits->total_company_profits ?? 0,
            'total_profits' => $profits->total_profits ?? 0,
            'avg_profit' => $profits->avg_profit ?? 0,
            'max_profit' => $profits->max_profit ?? 0,
            'total_invested' => $totalInvested,
            'overall_roi' => $totalInvested > 0 ? round((($profits->total_investor_profits ?? 0) / $totalInvested) * 100, 2) : 0,
        ];
    }

    private function getInvestmentStats(User $user): array
    {
        $investments = $user->investments();
        
        return [
            'total_count' => $investments->count(),
            'active_count' => $investments->where('status', 'active')->count(),
            'completed_count' => $investments->where('status', 'completed')->count(),
            'total_amount' => $investments->sum('amount'),
            'avg_amount' => $investments->avg('amount') ?? 0,
            'by_type' => $investments->selectRaw('
                investment_type,
                COUNT(*) as count,
                SUM(amount) as total,
                AVG(amount) as average
            ')
            ->groupBy('investment_type')
            ->get(),
        ];
    }

    private function getInvestmentPerformance(User $user): array
    {
        $investments = $user->investments()
            ->with(['profit'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();
        
        $performance = $investments->map(function ($investment) {
            $roi = $investment->amount > 0 ? 
                round((($investment->profit?->investor_share ?? 0) / $investment->amount) * 100, 2) : 0;
            
            return [
                'id' => $investment->id,
                'amount' => $investment->amount,
                'type' => $investment->investment_type,
                'status' => $investment->status,
                'created_at' => $investment->created_at,
                'profit' => $investment->profit,
                'roi_percentage' => $roi,
            ];
        });
        
        return $performance->toArray();
    }

    private function getTeamStats($team): array
    {
        if (!$team) {
            return [
                'total_members' => 0,
                'active_members' => 0,
                'total_invested' => 0,
                'total_value' => 0,
            ];
        }
        
        return [
            'total_members' => $team->teamMembers()->count(),
            'active_members' => $team->teamMembers()->whereHas('wallet', function ($query) {
                $query->where('balance', '>', 0);
            })->count(),
            'total_invested' => $team->teamMembers()->sum('wallet.balance'),
            'total_value' => $team->teamMembers()->sum('wallet.balance'),
            'member_rankings' => $this->getMemberRankings($team),
        ];
    }

    private function getTeamPerformance($team): array
    {
        if (!$team) {
            return [];
        }
        
        return $team->teamMembers()
            ->with(['investments', 'profits'])
            ->get()
            ->map(function ($member) {
                $totalInvested = $member->investments->sum('amount');
                $totalReturns = $member->profits->sum('investor_share');
                
                return [
                    'member' => $member,
                    'total_invested' => $totalInvested,
                    'total_returns' => $totalReturns,
                    'net_profit' => $totalReturns - $totalInvested,
                    'investment_count' => $member->investments->count(),
                    'profit_count' => $member->profits->count(),
                ];
            })
            ->toArray();
    }

    private function getMemberRankings($team): array
    {
        return $team->teamMembers()
            ->withCount(['investments', 'profits'])
            ->with(['investments' => function ($query) {
                $query->selectRaw('SUM(amount) as total_invested');
            }, 'profits' => function ($query) {
                $query->selectRaw('SUM(investor_share) as total_profits');
            }])
            ->orderByDesc('investments_count')
            ->get()
            ->map(function ($member, $index) {
                return [
                    'rank' => $index + 1,
                    'name' => $member->name,
                    'total_invested' => $member->investments_total_invested ?? 0,
                    'total_profits' => $member->profits_total_profits ?? 0,
                    'investments_count' => $member->investments_count ?? 0,
                    'profits_count' => $member->profits_count ?? 0,
                ];
            })
            ->toArray();
    }

    private function getProjectStats(User $user): array
    {
        $investments = $user->investments();
        $investedProjects = $investments->pluck('property_project_id')->unique();
        
        return [
            'total_projects' => $investedProjects->count(),
            'active_projects' => PropertyProject::whereIn('id', $investedProjects)->where('status', 'active')->count(),
            'total_invested' => $investments->sum('amount'),
            'avg_investment' => $investments->avg('amount') ?? 0,
            'by_type' => $investments->join('property_projects', 'investments.property_project_id', '=', 'property_projects.id')
                ->selectRaw('
                    property_projects.type,
                    COUNT(investments.id) as count,
                    SUM(investments.amount) as total
                ')
                ->groupBy('property_projects.type')
                ->get(),
        ];
    }

    private function getRecommendedProjects(User $user): array
    {
        $userInvestments = $user->investments();
        $investedTypes = $userInvestments->pluck('investment_type')->unique();
        
        return PropertyProject::where('status', 'active')
            ->whereIn('type', $investedTypes)
            ->withCount('plots')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->toArray();
    }

    private function getPlotStats(User $user): array
    {
        $userPlots = $user->investments()
            ->whereHas('plot')
            ->with('plot')
            ->get()
            ->pluck('plot');
        
        return [
            'total_plots' => $userPlots->count(),
            'total_value' => $userPlots->sum('pivot.price'),
            'avg_price' => $userPlots->avg('pivot.price') ?? 0,
            'by_project' => $userPlots->groupBy('property.name')->map(function ($plots, $project) {
                return [
                    'project' => $project,
                    'count' => $plots->count(),
                    'total_value' => $plots->sum('pivot.price'),
                ];
            }),
        ];
    }

    private function getProfitTrends(User $user): array
    {
        return $user->profits()
            ->selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                SUM(investor_share) as total_profit,
                COUNT(*) as count
            ')
            ->groupByRaw('DATE_FORMAT(created_at, "%Y-%m")')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get()
            ->toArray();
    }

    private function getTransactionSummary($wallet): array
    {
        return [
            'total_transactions' => $wallet->transactions()->count(),
            'total_deposits' => $wallet->transactions()->where('type', 'deposit')->sum('amount'),
            'total_withdrawals' => $wallet->transactions()->where('type', 'withdrawal')->sum('amount'),
            'total_investments' => $wallet->transactions()->where('type', 'investment')->sum('amount'),
            'total_profits' => $wallet->transactions()->where('type', 'profit')->sum('amount'),
            'pending_transactions' => $wallet->transactions()->where('status', 'pending')->count(),
        ];
    }

    private function getRecentActivity(User $user): array
    {
        return [
            'recent_investments' => $user->investments()
                ->with(['property', 'plot'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
            'recent_profits' => $user->profits()
                ->with(['sale.plot.property', 'investment'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
            'recent_transactions' => $user->wallet->transactions()
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
        ];
    }
}
