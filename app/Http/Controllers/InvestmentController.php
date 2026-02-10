<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Models\PropertyProject;
use App\Models\Plot;
use App\Models\User;
use App\Models\Team;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\PlotHolding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class InvestmentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = Investment::with(['user', 'property', 'plot', 'sourceInvestment'])
            ->where('user_id', $user->id);
        
        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('type')) {
            $query->where('investment_type', $request->type);
        }
        
        if ($request->has('project_id')) {
            $query->where('property_project_id', $request->project_id);
        }
        
        if ($request->has('plot_id')) {
            $query->where('plot_id', $request->plot_id);
        }
        
        $investments = $query->orderBy('created_at', 'desc')->paginate(20);
        
        // Get user investment stats
        $stats = Investment::getUserInvestmentStats($user->id);
        
        // Get available projects for investment
        $availableProjects = PropertyProject::active()
            ->where('available_plots', '>', 0)
            ->get();
        
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'investments' => $investments,
                    'stats' => $stats,
                    'available_projects' => $availableProjects
                ]
            ]);
        }

        return Inertia::render('Investment/Index', [
            'investments' => $investments,
            'stats' => $stats,
            'availableProjects' => $availableProjects,
            'filters' => $request->only(['status', 'type', 'project_id', 'plot_id'])
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        
        // Temporarily bypass eligibility check for testing
        // $eligibilityCheck = $this->checkInvestmentEligibility($user);
        // if (!$eligibilityCheck['eligible']) {
        //     return redirect()->back()->with('error', 'Not eligible for investment: ' . implode(', ', $eligibilityCheck['errors']));
        // }

        // Get available projects based on team value
        $team = $user->ledTeam ?? $user->teamMemberships->first()?->team;
        $projects = $this->getAvailableProjectsForUser($user, $team);
        
        // Get available plots
        $plots = Plot::with('property')->where('status', 'available')->get();

        return Inertia::render('Investment/Create', [
            'projects' => $projects,
            'plots' => $plots,
            'user_wallet_balance' => $user->wallet->balance ?? 0,
            'team_value' => $team?->team_value ?? 0,
            'min_investment' => 500
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:500',
            'investment_type' => 'required|in:project,plot,mixed',
            'property_project_id' => 'required_if:investment_type,project,mixed|exists:property_projects,id',
            'plot_ids' => 'required_if:investment_type,plot,mixed|array',
            'plot_ids.*' => 'exists:plots,id',
            'plot_allocations' => 'required_if:investment_type,plot,mixed|array',
            'plot_allocations.*' => 'numeric|min:1',
            'notes' => 'nullable|string|max:500',
            'auto_reinvest' => 'boolean',
            'reinvest_percentage' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $user = auth()->user();
        
        // Check investment eligibility
        $eligibilityCheck = $this->checkInvestmentEligibility($user);
        if (!$eligibilityCheck['eligible']) {
            return redirect()->back()
                ->with('error', 'Not eligible for investment: ' . implode(', ', $eligibilityCheck['errors']))
                ->withInput();
        }

        // Validate plot allocations if provided
        if ($request->has('plot_ids') && $request->has('plot_allocations')) {
            $totalAllocation = array_sum($request->plot_allocations);
            if ($totalAllocation != $request->amount) {
                return redirect()->back()
                    ->with('error', 'Plot allocations must sum to total investment amount')
                    ->withInput();
            }
        }

        try {
            DB::beginTransaction();

            // Create investment record
            $investment = Investment::create([
                'user_id' => $user->id,
                'property_project_id' => $request->property_project_id,
                'amount' => $request->amount,
                'investment_type' => $request->investment_type,
                'investment_date' => now(),
                'status' => 'pending',
                'notes' => $request->notes,
                'expected_return' => $this->calculateExpectedReturn($request->amount, $request->property_project_id),
                'return_rate' => $this->getReturnRate($request->property_project_id),
                'maturity_date' => $this->calculateMaturityDate($request->property_project_id),
            ]);

            // Handle plot allocations
            if ($request->has('plot_ids')) {
                foreach ($request->plot_ids as $index => $plotId) {
                    $allocation = $request->plot_allocations[$index] ?? 0;
                    if ($allocation > 0) {
                        PlotHolding::create([
                            'user_id' => $user->id,
                            'investment_id' => $investment->id,
                            'plot_id' => $plotId,
                            'amount_invested' => $allocation,
                            'percentage_owned' => ($allocation / $request->amount) * 100,
                            'status' => 'pending',
                        ]);
                    }
                }
            }

            // Set auto-reinvest settings
            if ($request->auto_reinvest) {
                $investment->update([
                    'auto_reinvest' => true,
                    'reinvest_percentage' => $request->reinvest_percentage ?? 100,
                ]);
            }

            // Create investment transaction
            Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $user->wallet->id,
                'investment_id' => $investment->id,
                'type' => 'investment',
                'amount' => $request->amount,
                'balance_before' => $user->wallet->balance,
                'balance_after' => $user->wallet->balance - $request->amount,
                'reference' => 'INV_' . strtoupper(uniqid()),
                'description' => "Investment in {$request->investment_type}",
                'status' => 'pending',
            ]);

            // Freeze investment amount in wallet
            $user->wallet->freezeAmount($request->amount);

            DB::commit();

            // Generate and send investment receipt
            $this->generateInvestmentReceipt($investment);

            return redirect()
                ->route('investment.show', $investment->id)
                ->with('success', 'Investment created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->back()
                ->with('error', 'Failed to create investment: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Request $request, string $id)
    {
        $user = auth()->user();
        $investment = Investment::with(['user', 'property', 'plotHoldings.plot', 'profits', 'reinvestments'])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $investment
            ]);
        }

        return Inertia::render('Investment/Show', [
            'investment' => $investment
        ]);
    }

    public function portfolio(Request $request)
    {
        $user = auth()->user();
        
        // Get user's complete investment portfolio
        $investments = Investment::with(['property', 'plotHoldings.plot', 'profits'])
            ->where('user_id', $user->id)
            ->get();

        // Calculate portfolio statistics
        $portfolioStats = $this->calculatePortfolioStats($investments);
        
        // Get project-wise allocation
        $projectAllocation = $this->getProjectAllocation($investments);
        
        // Get plot-wise allocation
        $plotAllocation = $this->getPlotAllocation($investments);
        
        // Get investment timeline
        $timeline = $this->getInvestmentTimeline($investments);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'investments' => $investments,
                    'portfolio_stats' => $portfolioStats,
                    'project_allocation' => $projectAllocation,
                    'plot_allocation' => $plotAllocation,
                    'timeline' => $timeline
                ]
            ]);
        }

        return Inertia::render('Investment/Portfolio', [
            'investments' => $investments,
            'portfolioStats' => $portfolioStats,
            'projectAllocation' => $projectAllocation,
            'plotAllocation' => $plotAllocation,
            'timeline' => $timeline
        ]);
    }

    public function reinvest(Request $request, string $investmentId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:500',
            'reinvest_type' => 'required|in:full,partial',
            'property_project_id' => 'nullable|exists:property_projects,id',
            'plot_ids' => 'nullable|array',
            'plot_ids.*' => 'exists:plots,id',
            'plot_allocations' => 'nullable|array',
            'plot_allocations.*' => 'numeric|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $sourceInvestment = Investment::where('user_id', $user->id)
            ->findOrFail($investmentId);

        if (!$sourceInvestment->canBeReinvested()) {
            return response()->json([
                'success' => false,
                'message' => 'Source investment cannot be reinvested'
            ], 422);
        }

        $reinvestAmount = $request->reinvest_type === 'full' 
            ? $sourceInvestment->actual_return 
            : min($request->amount, $sourceInvestment->actual_return);

        if ($reinvestAmount < 500) {
            return response()->json([
                'success' => false,
                'message' => 'Reinvestment amount must be at least ₹500'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create new investment from returns
            $newInvestment = Investment::create([
                'user_id' => $user->id,
                'property_project_id' => $request->property_project_id,
                'amount' => $reinvestAmount,
                'investment_type' => 'reinvestment',
                'investment_date' => now(),
                'status' => 'pending',
                'notes' => $request->notes,
                'source_investment_id' => $sourceInvestment->id,
                'expected_return' => $this->calculateExpectedReturn($reinvestAmount, $request->property_project_id),
                'return_rate' => $this->getReturnRate($request->property_project_id),
                'maturity_date' => $this->calculateMaturityDate($request->property_project_id),
            ]);

            // Handle plot allocations
            if ($request->has('plot_ids')) {
                foreach ($request->plot_ids as $index => $plotId) {
                    $allocation = $request->plot_allocations[$index] ?? 0;
                    if ($allocation > 0) {
                        PlotHolding::create([
                            'user_id' => $user->id,
                            'investment_id' => $newInvestment->id,
                            'plot_id' => $plotId,
                            'amount_invested' => $allocation,
                            'percentage_owned' => ($allocation / $reinvestAmount) * 100,
                            'status' => 'pending',
                        ]);
                    }
                }
            }

            // Create reinvestment transaction
            Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $user->wallet->id,
                'investment_id' => $newInvestment->id,
                'type' => 'reinvestment',
                'amount' => $reinvestAmount,
                'balance_before' => $user->wallet->balance,
                'balance_after' => $user->wallet->balance - $reinvestAmount,
                'reference' => 'REINV_' . strtoupper(uniqid()),
                'description' => "Reinvestment from investment #{$sourceInvestment->id}",
                'status' => 'pending',
            ]);

            // Update source investment
            $sourceInvestment->update([
                'reinvestment_count' => $sourceInvestment->reinvestment_count + 1,
            ]);

            // Freeze reinvestment amount in wallet
            $user->wallet->freezeAmount($reinvestAmount);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reinvestment created successfully',
                'data' => [
                    'investment' => $newInvestment->load(['user', 'property', 'plotHoldings.plot']),
                    'source_investment' => $sourceInvestment->fresh(),
                    'wallet' => $user->wallet->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create reinvestment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function modify(Request $request, string $investmentId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:500',
            'reason' => 'required|string|max:500',
            'new_property_project_id' => 'nullable|exists:property_projects,id',
            'new_plot_ids' => 'nullable|array',
            'new_plot_ids.*' => 'exists:plots,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $investment = Investment::where('user_id', $user->id)
            ->findOrFail($investmentId);

        if (!$investment->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending investments can be modified'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Handle amount change
            $amountDiff = $request->amount - $investment->amount;
            if ($amountDiff !== 0) {
                $wallet = $user->wallet;
                if ($amountDiff > 0) {
                    // Additional amount needed
                    if (!$wallet->canWithdraw($amountDiff)) {
                        throw new \Exception('Insufficient wallet balance for additional amount');
                    }
                    $wallet->freezeAmount($amountDiff);
                } else {
                    // Refund excess amount
                    $wallet->unfreezeAmount(abs($amountDiff));
                }
            }

            // Update investment
            $investment->update([
                'amount' => $request->amount,
                'property_project_id' => $request->new_property_project_id ?? $investment->property_project_id,
                'notes' => ($investment->notes ?? '') . "\n\nModification Request: " . $request->reason,
                'status' => 'pending_approval', // Requires admin approval
            ]);

            // Update plot allocations if provided
            if ($request->has('new_plot_ids')) {
                // Remove existing plot holdings
                $investment->plotHoldings()->delete();
                
                // Create new plot holdings
                foreach ($request->new_plot_ids as $plotId) {
                    PlotHolding::create([
                        'user_id' => $user->id,
                        'investment_id' => $investment->id,
                        'plot_id' => $plotId,
                        'amount_invested' => $request->amount / count($request->new_plot_ids),
                        'percentage_owned' => (100 / count($request->new_plot_ids)),
                        'status' => 'pending_approval',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Investment modification submitted for approval',
                'data' => [
                    'investment' => $investment->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to modify investment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancel(Request $request, string $investmentId)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $investment = Investment::where('user_id', $user->id)
            ->findOrFail($investmentId);

        if (!$investment->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending investments can be cancelled'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Cancel investment
            $investment->cancel($request->reason);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Investment cancelled successfully',
                'data' => [
                    'investment' => $investment->fresh(),
                    'wallet' => $user->wallet->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel investment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approveInvestment(Request $request, string $investmentId)
    {
        $investment = Investment::findOrFail($investmentId);

        if (!$investment->canBeApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Investment cannot be approved'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $investment->approve();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Investment approved successfully',
                'data' => [
                    'investment' => $investment->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve investment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTeamInvestments(Request $request, string $teamId)
    {
        $team = Team::findOrFail($teamId);
        $investments = Investment::byTeam($teamId)
            ->with(['user', 'property', 'plot'])
            ->get();

        $teamStats = Investment::getTeamInvestmentStats($teamId);
        
        // Get top investors
        $topInvestors = $investments->groupBy('user_id')
            ->map(function ($userInvestments) {
                return [
                    'user' => $userInvestments->first()->user,
                    'total_invested' => $userInvestments->sum('amount'),
                    'investment_count' => $userInvestments->count(),
                ];
            })
            ->sortByDesc('total_invested')
            ->take(10)
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'team' => $team,
                'investments' => $investments,
                'team_stats' => $teamStats,
                'top_investors' => $topInvestors
            ]
        ]);
    }

    public function downloadReceipt(Request $request, string $investmentId)
    {
        $user = auth()->user();
        $investment = Investment::with(['user', 'property', 'plotHoldings.plot'])
            ->where('user_id', $user->id)
            ->findOrFail($investmentId);

        $pdf = PDF::loadView('pdfs.investment-receipt', [
            'investment' => $investment
        ]);

        return $pdf->download("investment-receipt-{$investment->id}.pdf");
    }

    // Helper methods
    private function checkInvestmentEligibility(User $user): array
    {
        $errors = [];
        
        // Check user status
        if (!$user->isActive()) {
            $errors[] = 'User account must be active';
        }
        
        if (!$user->kyc_verified) {
            $errors[] = 'KYC verification required';
        }
        
        if ($user->registration_fee_paid < 500) {
            $errors[] = 'Registration fee must be paid';
        }
        
        // Check wallet balance
        $wallet = $user->wallet;
        if (!$wallet || $wallet->balance < 500) {
            $errors[] = 'Wallet balance must be at least ₹500';
        }
        
        // Check team requirements for team leaders
        if ($user->role === 'team_leader') {
            $team = $user->ledTeam;
            if (!$team || $team->member_count < 20) {
                $errors[] = 'Team must have at least 20 members';
            }
        }

        return [
            'eligible' => empty($errors),
            'errors' => $errors
        ];
    }

    private function getAvailableProjectsForUser(User $user, ?Team $team): array
    {
        $query = PropertyProject::active()
            ->where('available_plots', '>', 0);

        // Filter projects based on team value for premium access
        if ($team && $team->team_value > 1000000) { // ₹10 lakh team value
            // Allow access to premium projects
            $query->where(function ($q) {
                $q->where('type', 'regular')
                  ->orWhere('type', 'premium');
            });
        } else {
            // Only regular projects
            $query->where('type', 'regular');
        }

        return $query->get()->toArray();
    }

    private function calculateExpectedReturn(float $amount, ?int $projectId): float
    {
        if (!$projectId) {
            return $amount * 1.12; // Default 12% return
        }

        $project = PropertyProject::find($projectId);
        $rate = $project->expected_roi ?? 12;
        
        return $amount * (1 + ($rate / 100));
    }

    private function getReturnRate(?int $projectId): float
    {
        if (!$projectId) {
            return 12.0;
        }

        $project = PropertyProject::find($projectId);
        return $project->expected_roi ?? 12.0;
    }

    private function calculateMaturityDate(?int $projectId): string
    {
        // Default 24 months maturity
        return now()->addMonths(24)->format('Y-m-d');
    }

    private function generateInvestmentReceipt(Investment $investment): void
    {
        try {
            $pdf = PDF::loadView('pdfs.investment-receipt', [
                'investment' => $investment->load(['user', 'property', 'plotHoldings.plot'])
            ]);

            $filename = "investment-receipt-{$investment->id}.pdf";
            $path = "receipts/{$filename}";
            
            Storage::put($path, $pdf->output());
            
            // Send email with receipt
            Mail::to($investment->user->email)->send(new \App\Mail\InvestmentReceipt($investment, $path));
            
        } catch (\Exception $e) {
            \Log::error('Failed to generate investment receipt: ' . $e->getMessage());
        }
    }

    private function calculatePortfolioStats($investments): array
    {
        $totalInvested = $investments->sum('amount');
        $totalReturns = $investments->sum('actual_return');
        $activeInvestments = $investments->where('status', 'active')->count();
        $completedInvestments = $investments->where('status', 'completed')->count();
        
        return [
            'total_invested' => $totalInvested,
            'total_returns' => $totalReturns,
            'net_profit' => $totalReturns - $totalInvested,
            'total_investments' => $investments->count(),
            'active_investments' => $activeInvestments,
            'completed_investments' => $completedInvestments,
            'average_roi' => $totalInvested > 0 ? (($totalReturns - $totalInvested) / $totalInvested) * 100 : 0,
        ];
    }

    private function getProjectAllocation($investments): array
    {
        return $investments
            ->groupBy('property_project_id')
            ->map(function ($projectInvestments) {
                $project = $projectInvestments->first()->property;
                return [
                    'project' => $project,
                    'total_invested' => $projectInvestments->sum('amount'),
                    'investment_count' => $projectInvestments->count(),
                    'percentage' => ($projectInvestments->sum('amount') / $projectInvestments->sum('amount')) * 100,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getPlotAllocation($investments): array
    {
        $plotHoldings = collect();
        foreach ($investments as $investment) {
            $plotHoldings = $plotHoldings->merge($investment->plotHoldings);
        }

        return $plotHoldings
            ->groupBy('plot_id')
            ->map(function ($plotHoldings) {
                $plot = $plotHoldings->first()->plot;
                return [
                    'plot' => $plot,
                    'total_invested' => $plotHoldings->sum('amount_invested'),
                    'holding_count' => $plotHoldings->count(),
                    'percentage_owned' => $plotHoldings->sum('percentage_owned'),
                ];
            })
            ->values()
            ->toArray();
    }

    private function getInvestmentTimeline($investments): array
    {
        return $investments
            ->sortBy('investment_date')
            ->map(function ($investment) {
                return [
                    'date' => $investment->investment_date->format('Y-m-d'),
                    'investment_id' => $investment->id,
                    'amount' => $investment->amount,
                    'type' => $investment->investment_type,
                    'status' => $investment->status,
                    'project' => $investment->property?->name,
                    'plot' => $investment->plot?->plot_number,
                ];
            })
            ->values()
            ->toArray();
    }
}
