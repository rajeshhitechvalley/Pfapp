<?php

namespace App\Http\Controllers;

use App\Models\Reinvestment;
use App\Models\Profit;
use App\Models\Investment;
use App\Models\PropertyProject;
use App\Models\Plot;
use App\Models\User;
use App\Models\Team;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReinvestmentController extends Controller
{
    public function index(): Response
    {
        $reinvestments = Reinvestment::with(['profit', 'user', 'targetProperty', 'targetPlot', 'investment'])
            ->orderBy('reinvestment_date', 'desc')
            ->paginate(20);

        return Inertia::render('Reinvestments/Index', [
            'reinvestments' => $reinvestments->items(),
            'pagination' => [
                'current_page' => $reinvestments->currentPage(),
                'last_page' => $reinvestments->lastPage(),
                'per_page' => $reinvestments->perPage(),
                'total' => $reinvestments->total(),
                'from' => $reinvestments->firstItem(),
                'to' => $reinvestments->lastItem(),
            ]
        ]);
    }

    public function create(): Response
    {
        $availableProjects = PropertyProject::where('status', 'active')
            ->with(['plots' => function ($query) {
                $query->where('status', 'available');
            }])
            ->get();

        $availableProfits = Profit::where('distribution_status', 'distributed')
            ->where('reinvestment_status', '!=', 'reinvested')
            ->with(['user', 'sale'])
            ->get();

        return Inertia::render('Reinvestments/Create', [
            'availableProjects' => $availableProjects,
            'availableProfits' => $availableProfits,
        ]);
    }

    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'profit_id' => 'required|exists:profits,id',
            'amount' => 'required|numeric|min:0',
            'reinvestment_type' => 'required|in:manual,auto',
            'target_property_project_id' => 'nullable|exists:property_projects,id',
            'target_plot_id' => 'nullable|exists:plots,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $profit = Profit::find($validated['profit_id']);
        
        if ($profit->reinvestment_status === 'reinvested') {
            return redirect()->back()
                ->with('error', 'Profit has already been fully reinvested.');
        }

        if ($validated['amount'] > $profit->total_investor_share) {
            return redirect()->back()
                ->with('error', 'Reinvestment amount exceeds available profit.');
        }

        $user = $profit->user;
        $wallet = $user->wallet;

        if (!$wallet || $wallet->balance < $validated['amount']) {
            return redirect()->back()
                ->with('error', 'Insufficient wallet balance for reinvestment.');
        }

        // Create reinvestment record
        $reinvestment = Reinvestment::create([
            'profit_id' => $validated['profit_id'],
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'reinvestment_date' => now(),
            'status' => 'active',
            'target_property_project_id' => $validated['target_property_project_id'],
            'target_plot_id' => $validated['target_plot_id'],
            'notes' => $validated['notes'],
            'created_by' => Auth::id(),
        ]);

        // Create transaction
        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'profit_id' => $profit->id,
            'reinvestment_id' => $reinvestment->id,
            'type' => 'reinvestment',
            'amount' => $validated['amount'],
            'balance_before' => $wallet->balance,
            'balance_after' => $wallet->balance - $validated['amount'],
            'reference' => 'REINV_' . strtoupper(uniqid()),
            'description' => "Reinvestment of profit from sale #{$profit->sale_id}",
            'status' => 'completed',
        ]);

        // Update wallet balance
        $wallet->deductBalance($validated['amount']);

        // Update profit status
        $remainingAmount = $profit->total_investor_share - $validated['amount'];
        $profit->update([
            'reinvestment_amount' => $profit->reinvestment_amount + $validated['amount'],
            'reinvestment_date' => now(),
            'reinvestment_status' => $remainingAmount > 0 ? 'partial' : 'reinvested',
            'updated_by' => Auth::id(),
        ]);

        // If auto reinvestment, create investment
        if ($validated['reinvestment_type'] === 'auto') {
            $this->createAutoInvestment($reinvestment, $validated);
        }

        return redirect()->route('reinvestments.show', $reinvestment->id)
            ->with('success', 'Reinvestment created successfully.');
    }

    public function show(Reinvestment $reinvestment): Response
    {
        $reinvestment->load(['profit', 'user', 'targetProperty', 'targetPlot', 'investment']);

        return Inertia::render('Reinvestments/Show', [
            'reinvestment' => $reinvestment,
            'reinvestment_details' => $reinvestment->getReinvestmentDetails(),
        ]);
    }

    public function edit(Reinvestment $reinvestment): Response
    {
        return Inertia::render('Reinvestments/Edit', [
            'reinvestment' => $reinvestment
        ]);
    }

    public function update(Request $request, Reinvestment $reinvestment): Response
    {
        $validated = $request->validate([
            'target_property_project_id' => 'nullable|exists:property_projects,id',
            'target_plot_id' => 'nullable|exists:plots,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($reinvestment->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot edit completed reinvestment.');
        }

        $reinvestment->update([
            'target_property_project_id' => $validated['target_property_project_id'],
            'target_plot_id' => $validated['target_plot_id'],
            'notes' => $validated['notes'],
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('reinvestments.show', $reinvestment->id)
            ->with('success', 'Reinvestment updated successfully.');
    }

    public function complete(Reinvestment $reinvestment): Response
    {
        if ($reinvestment->status !== 'active') {
            return redirect()->back()
                ->with('error', 'Only active reinvestments can be completed.');
        }

        if ($reinvestment->completeReinvestment()) {
            return redirect()->back()
                ->with('success', 'Reinvestment completed successfully.');
        }

        return redirect()->back()
            ->with('error', 'Failed to complete reinvestment.');
    }

    public function cancel(Request $request, Reinvestment $reinvestment): Response
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if ($reinvestment->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot cancel completed reinvestment.');
        }

        if ($reinvestment->cancelReinvestment($validated['reason'])) {
            return redirect()->back()
                ->with('success', 'Reinvestment cancelled successfully.');
        }

        return redirect()->back()
            ->with('error', 'Failed to cancel reinvestment.');
    }

    public function bulkAutoReinvest(Request $request): Response
    {
        $validated = $request->validate([
            'profit_ids' => 'required|array',
            'profit_ids.*' => 'exists:profits,id',
            'target_property_project_id' => 'required|exists:property_projects,id',
            'reinvestment_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $property = PropertyProject::find($validated['target_property_project_id']);
        $processedCount = 0;
        $failedCount = 0;

        foreach ($validated['profit_ids'] as $profitId) {
            $profit = Profit::find($profitId);
            
            if ($profit && $profit->distribution_status === 'distributed' && $profit->reinvestment_status !== 'reinvested') {
                $reinvestmentAmount = $profit->total_investor_share * ($validated['reinvestment_percentage'] / 100);
                
                if ($this->processAutoReinvestment($profit, $reinvestmentAmount, $validated['target_property_project_id'])) {
                    $processedCount++;
                } else {
                    $failedCount++;
                }
            } else {
                $failedCount++;
            }
        }

        return redirect()->back()
            ->with('success', "Successfully processed {$processedCount} auto reinvestments. Failed: {$failedCount}");
    }

    public function getTeamRevenueFlow(Team $team): Response
    {
        $teamRevenue = $this->calculateTeamRevenueFlow($team);
        $teamReinvestments = $this->getTeamReinvestments($team);
        $teamPerformance = $this->getTeamReinvestmentPerformance($team);

        return response()->json([
            'team_revenue' => $teamRevenue,
            'team_reinvestments' => $teamReinvestments,
            'team_performance' => $teamPerformance,
        ]);
    }

    public function getProjectRevenueFlow(PropertyProject $project): Response
    {
        $projectRevenue = $this->calculateProjectRevenueFlow($project);
        $projectReinvestments = $this->getProjectReinvestments($project);
        $projectPerformance = $this->getProjectReinvestmentPerformance($project);

        return response()->json([
            'project_revenue' => $projectRevenue,
            'project_reinvestments' => $projectReinvestments,
            'project_performance' => $projectPerformance,
        ]);
    }

    public function getReinvestmentDashboard(): Response
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        $dashboard = [
            'today_reinvestments' => Reinvestment::whereDate('reinvestment_date', $today)->count(),
            'today_amount' => Reinvestment::whereDate('reinvestment_date', $today)->sum('amount'),
            'this_month_reinvestments' => Reinvestment::where('reinvestment_date', '>=', $thisMonth)->count(),
            'this_month_amount' => Reinvestment::where('reinvestment_date', '>=', $thisMonth)->sum('amount'),
            'last_month_reinvestments' => Reinvestment::whereBetween('reinvestment_date', [$lastMonth, $thisMonth])->count(),
            'last_month_amount' => Reinvestment::whereBetween('reinvestment_date', [$lastMonth, $thisMonth])->sum('amount'),
            'this_year_reinvestments' => Reinvestment::where('reinvestment_date', '>=', $thisYear)->count(),
            'this_year_amount' => Reinvestment::where('reinvestment_date', '>=', $thisYear)->sum('amount'),
            'active_reinvestments' => Reinvestment::where('status', 'active')->count(),
            'active_amount' => Reinvestment::where('status', 'active')->sum('amount'),
            'completed_reinvestments' => Reinvestment::where('status', 'completed')->count(),
            'completed_amount' => Reinvestment::where('status', 'completed')->sum('amount'),
            'pending_reinvestments' => Reinvestment::where('status', 'pending')->count(),
            'pending_amount' => Reinvestment::where('status', 'pending')->sum('amount'),
        ];

        return response()->json($dashboard);
    }

    public function getReinvestmentReport(Request $request): Response
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
            'project_id' => 'nullable|exists:property_projects,id',
            'status' => 'nullable|in:active,completed,pending',
        ]);

        $query = Reinvestment::whereBetween('reinvestment_date', [$validated['start_date'], $validated['end_date']]);

        if ($validated['user_id']) {
            $query->where('user_id', $validated['user_id']);
        }

        if ($validated['project_id']) {
            $query->where('target_property_project_id', $validated['project_id']);
        }

        if ($validated['status']) {
            $query->where('status', $validated['status']);
        }

        $reinvestments = $query->with(['profit', 'user', 'targetProperty', 'targetPlot'])
            ->orderBy('reinvestment_date', 'desc')
            ->get();

        $reportData = $reinvestments->map(function ($reinvestment) {
            return [
                'id' => $reinvestment->id,
                'user' => $reinvestment->user->name,
                'amount' => $reinvestment->getFormattedAmount(),
                'reinvestment_date' => $reinvestment->reinvestment_date->format('Y-m-d'),
                'status' => $reinvestment->getReinvestmentStatusAttribute(),
                'target_property' => $reinvestment->targetProperty?->name,
                'target_plot' => $reinvestment->targetPlot?->plot_number,
                'profit_amount' => $reinvestment->profit->getFormattedTotalInvestorShare(),
                'days_since_reinvestment' => $reinvestment->getDaysSinceReinvestmentAttribute(),
                'reinvestment_period' => $reinvestment->getReinvestmentPeriodAttribute(),
            ];
        });

        return response()->json([
            'reinvestments' => $reportData,
            'summary' => $this->getReinvestmentSummary($reinvestments),
        ]);
    }

    public function getUserReinvestmentReport(int $userId): Response
    {
        $reinvestments = Reinvestment::where('user_id', $userId)
            ->with(['profit', 'targetProperty', 'targetPlot'])
            ->orderBy('reinvestment_date', 'desc')
            ->get();

        $summary = $reinvestments->first()?->getUserReinvestmentSummary($userId) ?? [];

        return response()->json([
            'reinvestments' => $reinvestments->map(function ($reinvestment) {
                return [
                    'id' => $reinvestment->id,
                    'amount' => $reinvestment->getFormattedAmount(),
                    'reinvestment_date' => $reinvestment->reinvestment_date->format('Y-m-d'),
                    'status' => $reinvestment->getReinvestmentStatusAttribute(),
                    'target_property' => $reinvestment->targetProperty?->name,
                    'target_plot' => $reinvestment->targetPlot?->plot_number,
                    'profit_amount' => $reinvestment->profit->getFormattedTotalInvestorShare(),
                    'days_since_reinvestment' => $reinvestment->getDaysSinceReinvestmentAttribute(),
                ];
            }),
            'summary' => $summary,
        ]);
    }

    public function getReinvestmentTrends(Request $request): Response
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $trends = Reinvestment::whereBetween('reinvestment_date', [$validated['start_date'], $validated['end_date']])
            ->getReinvestmentTrends($validated['start_date'], $validated['end_date']);

        return response()->json([
            'trends' => $trends,
        ]);
    }

    // Helper Methods
    private function createAutoInvestment(Reinvestment $reinvestment, array $data): bool
    {
        if ($data['target_property_project_id'] && $data['target_plot_id']) {
            $investment = Investment::create([
                'user_id' => $reinvestment->user_id,
                'property_project_id' => $data['target_property_project_id'],
                'plot_id' => $data['target_plot_id'],
                'amount' => $reinvestment->amount,
                'investment_type' => 'reinvestment',
                'investment_date' => now(),
                'status' => 'active',
                'created_by' => Auth::id(),
            ]);

            $reinvestment->update([
                'investment_id' => $investment->id,
            ]);

            return true;
        }

        return false;
    }

    private function processAutoReinvestment(Profit $profit, float $amount, int $targetProjectId): bool
    {
        $user = $profit->user;
        $wallet = $user->wallet;

        if (!$wallet || $wallet->balance < $amount) {
            return false;
        }

        // Find available plot in target project
        $plot = Plot::where('property_project_id', $targetProjectId)
            ->where('status', 'available')
            ->first();

        if (!$plot) {
            return false;
        }

        // Create reinvestment record
        $reinvestment = Reinvestment::create([
            'profit_id' => $profit->id,
            'user_id' => $user->id,
            'amount' => $amount,
            'reinvestment_date' => now(),
            'status' => 'active',
            'target_property_project_id' => $targetProjectId,
            'target_plot_id' => $plot->id,
            'notes' => 'Auto reinvestment',
            'created_by' => Auth::id(),
        ]);

        // Create transaction
        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'profit_id' => $profit->id,
            'reinvestment_id' => $reinvestment->id,
            'type' => 'reinvestment',
            'amount' => $amount,
            'balance_before' => $wallet->balance,
            'balance_after' => $wallet->balance - $amount,
            'reference' => 'AUTO_REINV_' . strtoupper(uniqid()),
            'description' => "Auto reinvestment of profit from sale #{$profit->sale_id}",
            'status' => 'completed',
        ]);

        // Update wallet balance
        $wallet->deductBalance($amount);

        // Create investment
        $investment = Investment::create([
            'user_id' => $user->id,
            'property_project_id' => $targetProjectId,
            'plot_id' => $plot->id,
            'amount' => $amount,
            'investment_type' => 'auto_reinvestment',
            'investment_date' => now(),
            'status' => 'active',
            'created_by' => Auth::id(),
        ]);

        // Update plot status
        $plot->update(['status' => 'sold']);

        // Update reinvestment record
        $reinvestment->update(['investment_id' => $investment->id]);

        // Update profit status
        $remainingAmount = $profit->total_investor_share - $amount;
        $profit->update([
            'reinvestment_amount' => $profit->reinvestment_amount + $amount,
            'reinvestment_date' => now(),
            'reinvestment_status' => $remainingAmount > 0 ? 'partial' : 'reinvested',
            'updated_by' => Auth::id(),
        ]);

        return true;
    }

    private function calculateTeamRevenueFlow(Team $team): array
    {
        $teamMembers = $team->teamMembers;
        $totalRevenue = 0;
        $totalReinvested = 0;
        $reinvestmentRate = 0;

        foreach ($teamMembers as $member) {
            $memberRevenue = $member->profits()->sum('total_investor_share');
            $memberReinvested = $member->reinvestments()->sum('amount');
            
            $totalRevenue += $memberRevenue;
            $totalReinvested += $memberReinvested;
        }

        if ($totalRevenue > 0) {
            $reinvestmentRate = ($totalReinvested / $totalRevenue) * 100;
        }

        return [
            'total_revenue' => $totalRevenue,
            'total_reinvested' => $totalReinvested,
            'reinvestment_rate' => round($reinvestmentRate, 2),
            'team_size' => $teamMembers->count(),
            'avg_revenue_per_member' => $teamMembers->count() > 0 ? $totalRevenue / $teamMembers->count() : 0,
            'avg_reinvested_per_member' => $teamMembers->count() > 0 ? $totalReinvested / $teamMembers->count() : 0,
        ];
    }

    private function getTeamReinvestments(Team $team): array
    {
        return $team->teamMembers()
            ->with(['reinvestments' => function ($query) {
                $query->with(['targetProperty', 'targetPlot'])->orderBy('reinvestment_date', 'desc');
            }])
            ->get()
            ->flatMap(function ($member) {
                return $member->reinvestments->map(function ($reinvestment) use ($member) {
                    return [
                        'member' => $member->name,
                        'amount' => $reinvestment->getFormattedAmount(),
                        'reinvestment_date' => $reinvestment->reinvestment_date->format('Y-m-d'),
                        'status' => $reinvestment->getReinvestmentStatusAttribute(),
                        'target_property' => $reinvestment->targetProperty?->name,
                        'target_plot' => $reinvestment->targetPlot?->plot_number,
                    ];
                });
            })
            ->toArray();
    }

    private function getTeamReinvestmentPerformance(Team $team): array
    {
        $teamMembers = $team->teamMembers;
        
        return $teamMembers->map(function ($member) {
            $totalRevenue = $member->profits()->sum('total_investor_share');
            $totalReinvested = $member->reinvestments()->sum('amount');
            $reinvestmentRate = $totalRevenue > 0 ? ($totalReinvested / $totalRevenue) * 100 : 0;
            
            return [
                'member' => $member->name,
                'total_revenue' => $totalRevenue,
                'total_reinvested' => $totalReinvested,
                'reinvestment_rate' => round($reinvestmentRate, 2),
                'reinvestment_count' => $member->reinvestments()->count(),
            ];
        })
        ->sortByDesc('reinvestment_rate')
        ->values()
        ->toArray();
    }

    private function calculateProjectRevenueFlow(PropertyProject $project): array
    {
        $projectProfits = $project->profits();
        $totalRevenue = $projectProfits->sum('total_investor_share');
        $totalReinvested = $project->reinvestments()->sum('amount');
        $reinvestmentRate = $totalRevenue > 0 ? ($totalReinvested / $totalRevenue) * 100 : 0;

        return [
            'total_revenue' => $totalRevenue,
            'total_reinvested' => $totalReinvested,
            'reinvestment_rate' => round($reinvestmentRate, 2),
            'total_investors' => $projectProfits->distinct('user_id')->count(),
            'avg_revenue_per_investor' => $projectProfits->distinct('user_id')->count() > 0 ? $totalRevenue / $projectProfits->distinct('user_id')->count() : 0,
            'avg_reinvested_per_investor' => $projectProfits->distinct('user_id')->count() > 0 ? $totalReinvested / $projectProfits->distinct('user_id')->count() : 0,
        ];
    }

    private function getProjectReinvestments(PropertyProject $project): array
    {
        return $project->reinvestments()
            ->with(['user', 'targetPlot'])
            ->orderBy('reinvestment_date', 'desc')
            ->get()
            ->map(function ($reinvestment) {
                return [
                    'user' => $reinvestment->user->name,
                    'amount' => $reinvestment->getFormattedAmount(),
                    'reinvestment_date' => $reinvestment->reinvestment_date->format('Y-m-d'),
                    'status' => $reinvestment->getReinvestmentStatusAttribute(),
                    'target_plot' => $reinvestment->targetPlot?->plot_number,
                ];
            })
            ->toArray();
    }

    private function getProjectReinvestmentPerformance(PropertyProject $project): array
    {
        return $project->profits()
            ->with(['user', 'reinvestments'])
            ->get()
            ->groupBy('user_id')
            ->map(function ($userProfits) {
                $user = $userProfits->first()->user;
                $totalRevenue = $userProfits->sum('total_investor_share');
                $totalReinvested = $userProfits->flatMap->reinvestments->sum('amount');
                $reinvestmentRate = $totalRevenue > 0 ? ($totalReinvested / $totalRevenue) * 100 : 0;
                
                return [
                    'user' => $user->name,
                    'total_revenue' => $totalRevenue,
                    'total_reinvested' => $totalReinvested,
                    'reinvestment_rate' => round($reinvestmentRate, 2),
                    'reinvestment_count' => $userProfits->flatMap->reinvestments->count(),
                ];
            })
            ->sortByDesc('reinvestment_rate')
            ->values()
            ->toArray();
    }

    private function getReinvestmentSummary($reinvestments): array
    {
        return [
            'total_reinvestments' => $reinvestments->count(),
            'total_reinvested_amount' => $reinvestments->sum('amount'),
            'avg_reinvestment_amount' => $reinvestments->avg('amount'),
            'max_reinvestment_amount' => $reinvestments->max('amount'),
            'active_reinvestments' => $reinvestments->where('status', 'active')->count(),
            'completed_reinvestments' => $reinvestments->where('status', 'completed')->count(),
            'pending_reinvestments' => $reinvestments->where('status', 'pending')->count(),
        ];
    }
}
