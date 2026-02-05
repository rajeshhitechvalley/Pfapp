<?php

namespace App\Http\Controllers;

use App\Models\Profit;
use App\Models\Sale;
use App\Models\Investment;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Reinvestment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProfitController extends Controller
{
    public function index(): Response
    {
        $profits = Profit::with(['sale', 'investment', 'user', 'propertyProject'])
            ->orderBy('profit_period_start', 'desc')
            ->paginate(20);

        return Inertia::render('Profits/Index', [
            'profits' => $profits->items(),
            'pagination' => [
                'current_page' => $profits->currentPage(),
                'last_page' => $profits->lastPage(),
                'per_page' => $profits->perPage(),
                'total' => $profits->total(),
                'from' => $profits->firstItem(),
                'to' => $profits->lastItem(),
            ]
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Profits/Create');
    }

    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'calculation_method' => 'required|in:sale_based,manual',
            'total_profit' => 'required|numeric|min:0',
            'company_percentage' => 'required|numeric|min:0|max:100',
            'profit_period_start' => 'required|date',
            'profit_period_end' => 'required|date|after_or_equal:profit_period_start',
            'notes' => 'nullable|string|max:1000',
        ]);

        $sale = Sale::find($validated['sale_id']);
        
        // Check if profit already exists for this sale
        if ($sale->profits()->exists()) {
            return redirect()->back()
                ->with('error', 'Profit already calculated for this sale.');
        }

        $profit = new Profit();
        $profitData = $profit->calculateProfitFromSale($sale);
        
        // Override with manual values if provided
        if ($validated['calculation_method'] === 'manual') {
            $profitData['total_profit'] = $validated['total_profit'];
            $profitData['company_percentage'] = $validated['company_percentage'];
            $profitData['company_share'] = $validated['total_profit'] * ($validated['company_percentage'] / 100);
            $profitData['investor_share'] = $validated['total_profit'] - $profitData['company_share'];
            $profitData['team_share'] = 0; // Manual calculation doesn't include team bonus
            $profitData['total_investor_share'] = $profitData['investor_share'];
        }

        $profit = $profit->create(array_merge($profitData, [
            'sale_id' => $sale->id,
            'investment_id' => $sale->investment_id,
            'user_id' => $sale->investment?->user_id,
            'property_project_id' => $sale->property_project_id,
            'plot_id' => $sale->plot_id,
            'profit_period_start' => $validated['profit_period_start'],
            'profit_period_end' => $validated['profit_period_end'],
            'calculation_method' => $validated['calculation_method'],
            'notes' => $validated['notes'],
            'distribution_status' => 'pending',
            'reinvestment_status' => 'available',
            'created_by' => Auth::id(),
        ]));

        return redirect()->route('profits.show', $profit->id)
            ->with('success', 'Profit calculated successfully.');
    }

    public function show(Profit $profit): Response
    {
        $profit->load(['sale', 'investment', 'user', 'propertyProject', 'plot', 'reinvestments', 'transactions']);

        return Inertia::render('Profits/Show', [
            'profit' => $profit,
            'profit_breakdown' => $profit->getProfitBreakdown(),
            'distribution_timeline' => $profit->getDistributionTimeline(),
        ]);
    }

    public function edit(Profit $profit): Response
    {
        return Inertia::render('Profits/Edit', [
            'profit' => $profit
        ]);
    }

    public function update(Request $request, Profit $profit): Response
    {
        $validated = $request->validate([
            'total_profit' => 'required|numeric|min:0',
            'company_percentage' => 'required|numeric|min:0|max:100',
            'profit_period_start' => 'required|date',
            'profit_period_end' => 'required|date|after_or_equal:profit_period_start',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($profit->distribution_status === 'distributed') {
            return redirect()->back()
                ->with('error', 'Cannot edit profit that has been distributed.');
        }

        $companyShare = $validated['total_profit'] * ($validated['company_percentage'] / 100);
        $investorShare = $validated['total_profit'] - $companyShare;

        $profit->update([
            'total_profit' => $validated['total_profit'],
            'company_percentage' => $validated['company_percentage'],
            'company_share' => $companyShare,
            'investor_share' => $investorShare,
            'total_investor_share' => $investorShare,
            'profit_period_start' => $validated['profit_period_start'],
            'profit_period_end' => $validated['profit_period_end'],
            'notes' => $validated['notes'],
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('profits.show', $profit->id)
            ->with('success', 'Profit updated successfully.');
    }

    public function distribute(Request $request, Profit $profit): Response
    {
        if ($profit->distribution_status === 'distributed') {
            return redirect()->back()
                ->with('error', 'Profit has already been distributed.');
        }

        if ($profit->distributeProfit()) {
            return redirect()->back()
                ->with('success', 'Profit distributed successfully.');
        }

        return redirect()->back()
            ->with('error', 'Failed to distribute profit.');
    }

    public function bulkDistribute(Request $request): Response
    {
        $validated = $request->validate([
            'profit_ids' => 'required|array',
            'profit_ids.*' => 'exists:profits,id',
        ]);

        $distributedCount = 0;
        $failedCount = 0;

        foreach ($validated['profit_ids'] as $profitId) {
            $profit = Profit::find($profitId);
            
            if ($profit && $profit->distribution_status === 'pending') {
                if ($profit->distributeProfit()) {
                    $distributedCount++;
                } else {
                    $failedCount++;
                }
            } else {
                $failedCount++;
            }
        }

        return redirect()->back()
            ->with('success', "Successfully distributed {$distributedCount} profits. Failed: {$failedCount}");
    }

    public function reinvest(Request $request, Profit $profit): Response
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0|max:' . $profit->total_investor_share,
        ]);

        if ($profit->reinvestProfit($validated['amount'])) {
            return redirect()->back()
                ->with('success', 'Profit reinvested successfully.');
        }

        return redirect()->back()
            ->with('error', 'Failed to reinvest profit.');
    }

    public function withdraw(Request $request, Profit $profit): Response
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0|max:' . $profit->total_investor_share,
        ]);

        if ($profit->withdrawProfit($validated['amount'])) {
            return redirect()->back()
                ->with('success', 'Profit withdrawn successfully.');
        }

        return redirect()->back()
            ->with('error', 'Failed to withdraw profit.');
    }

    public function destroy(Profit $profit): Response
    {
        if ($profit->distribution_status === 'distributed') {
            return redirect()->back()
                ->with('error', 'Cannot delete profit that has been distributed.');
        }

        $profit->delete();

        return redirect()->route('profits.index')
            ->with('success', 'Profit deleted successfully.');
    }

    public function calculateFromSale(Request $request): Response
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
        ]);

        $sale = Sale::find($validated['sale_id']);
        
        if ($sale->profits()->exists()) {
            return response()->json([
                'error' => 'Profit already calculated for this sale.'
            ], 422);
        }

        $profit = new Profit();
        $profitData = $profit->calculateProfitFromSale($sale);

        return response()->json([
            'sale' => $sale,
            'profit_calculation' => $profitData,
        ]);
    }

    public function getProfitReport(Request $request): Response
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
            'project_id' => 'nullable|exists:property_projects,id',
            'status' => 'nullable|in:pending,distributed,failed',
        ]);

        $query = Profit::whereBetween('profit_period_start', [$validated['start_date'], $validated['end_date']]);

        if ($validated['user_id']) {
            $query->where('user_id', $validated['user_id']);
        }

        if ($validated['project_id']) {
            $query->where('property_project_id', $validated['project_id']);
        }

        if ($validated['status']) {
            $query->where('distribution_status', $validated['status']);
        }

        $profits = $query->with(['sale', 'investment', 'user', 'propertyProject'])
            ->orderBy('profit_period_start', 'desc')
            ->get();

        $reportData = $profits->map(function ($profit) {
            return [
                'id' => $profit->id,
                'user' => $profit->user->name,
                'project' => $profit->propertyProject->name,
                'total_profit' => $profit->getFormattedTotalProfit(),
                'company_share' => $profit->getFormattedCompanyShare(),
                'investor_share' => $profit->getFormattedInvestorShare(),
                'team_share' => $profit->getFormattedTeamShare(),
                'total_investor_share' => $profit->getFormattedTotalInvestorShare(),
                'profit_margin' => $profit->getProfitMarginAttribute(),
                'investment_roi' => $profit->getInvestmentRoiAttribute(),
                'distribution_status' => $profit->getDistributionStatusAttribute(),
                'distributed_at' => $profit->distributed_at?->format('Y-m-d'),
                'reinvestment_status' => $profit->getReinvestmentStatusAttribute(),
                'reinvestment_amount' => $profit->getFormattedReinvestmentAmount(),
                'profit_period' => $profit->getProfitPeriodAttribute(),
            ];
        });

        return response()->json([
            'profits' => $reportData,
            'summary' => $this->getProfitSummary($profits),
        ]);
    }

    public function getProfitSummary($profits): array
    {
        return [
            'total_profits' => $profits->count(),
            'total_profit_amount' => $profits->sum('total_profit'),
            'total_company_share' => $profits->sum('company_share'),
            'total_investor_share' => $profits->sum('investor_share'),
            'total_team_share' => $profits->sum('team_share'),
            'total_investor_share_amount' => $profits->sum('total_investor_share'),
            'avg_profit' => $profits->avg('total_profit'),
            'max_profit' => $profits->max('total_profit'),
            'distributed_profits' => $profits->where('distribution_status', 'distributed')->count(),
            'pending_profits' => $profits->where('distribution_status', 'pending')->count(),
            'reinvested_profits' => $profits->where('reinvestment_status', 'reinvested')->count(),
        ];
    }

    public function getUserProfitReport(int $userId): Response
    {
        $profits = Profit::where('user_id', $userId)
            ->with(['sale', 'investment', 'propertyProject'])
            ->orderBy('profit_period_start', 'desc')
            ->get();

        $summary = $profits->first()?->getUserProfitSummary($userId) ?? [];

        return response()->json([
            'profits' => $profits->map(function ($profit) {
                return [
                    'id' => $profit->id,
                    'project' => $profit->propertyProject->name,
                    'total_profit' => $profit->getFormattedTotalProfit(),
                    'investor_share' => $profit->getFormattedInvestorShare(),
                    'team_share' => $profit->getFormattedTeamShare(),
                    'total_investor_share' => $profit->getFormattedTotalInvestorShare(),
                    'investment_roi' => $profit->getInvestmentRoiAttribute(),
                    'distribution_status' => $profit->getDistributionStatusAttribute(),
                    'distributed_at' => $profit->distributed_at?->format('Y-m-d'),
                    'reinvestment_status' => $profit->getReinvestmentStatusAttribute(),
                    'reinvestment_amount' => $profit->getFormattedReinvestmentAmount(),
                ];
            }),
            'summary' => $summary,
        ]);
    }

    public function getCompanyProfitReport(Request $request): Response
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $summary = Profit::whereBetween('profit_period_start', [$validated['start_date'], $validated['end_date']])
            ->getCompanyProfitSummary($validated['start_date'], $validated['end_date']);

        $trends = Profit::whereBetween('profit_period_start', [$validated['start_date'], $validated['end_date']])
            ->getProfitTrends($validated['start_date'], $validated['end_date']);

        return response()->json([
            'summary' => $summary,
            'trends' => $trends,
        ]);
    }

    public function getProfitTrends(Request $request): Response
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $trends = Profit::whereBetween('profit_period_start', [$validated['start_date'], $validated['end_date']])
            ->getProfitTrends($validated['start_date'], $validated['end_date']);

        return response()->json([
            'trends' => $trends,
        ]);
    }

    public function getPendingProfits(): Response
    {
        $profits = Profit::where('distribution_status', 'pending')
            ->with(['sale', 'investment', 'user', 'propertyProject'])
            ->orderBy('profit_period_start', 'desc')
            ->get();

        return response()->json([
            'profits' => $profits,
            'total_pending' => $profits->count(),
            'total_amount' => $profits->sum('total_investor_share'),
        ]);
    }

    public function getProfitDashboard(): Response
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        $dashboard = [
            'today_profits' => Profit::whereDate('profit_period_start', $today)->count(),
            'today_amount' => Profit::whereDate('profit_period_start', $today)->sum('total_profit'),
            'this_month_profits' => Profit::where('profit_period_start', '>=', $thisMonth)->count(),
            'this_month_amount' => Profit::where('profit_period_start', '>=', $thisMonth)->sum('total_profit'),
            'last_month_profits' => Profit::whereBetween('profit_period_start', [$lastMonth, $thisMonth])->count(),
            'last_month_amount' => Profit::whereBetween('profit_period_start', [$lastMonth, $thisMonth])->sum('total_profit'),
            'this_year_profits' => Profit::where('profit_period_start', '>=', $thisYear)->count(),
            'this_year_amount' => Profit::where('profit_period_start', '>=', $thisYear)->sum('total_profit'),
            'pending_profits' => Profit::where('distribution_status', 'pending')->count(),
            'pending_amount' => Profit::where('distribution_status', 'pending')->sum('total_investor_share'),
            'distributed_profits' => Profit::where('distribution_status', 'distributed')->count(),
            'distributed_amount' => Profit::where('distribution_status', 'distributed')->sum('total_investor_share'),
            'reinvested_profits' => Profit::where('reinvestment_status', 'reinvested')->count(),
            'reinvested_amount' => Profit::where('reinvestment_status', 'reinvested')->sum('reinvestment_amount'),
        ];

        return response()->json($dashboard);
    }
}
