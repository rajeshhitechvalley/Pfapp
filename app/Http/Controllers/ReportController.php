<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Team;
use App\Models\Investment;
use App\Models\Profit;
use App\Models\Reinvestment;
use App\Models\PropertyProject;
use App\Models\Plot;
use App\Models\Sale;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Reports/Index');
    }

    public function dashboard(): Response
    {
        $dashboard = $this->getAnalyticsDashboard();

        return Inertia::render('Reports/Dashboard', [
            'dashboard' => $dashboard,
        ]);
    }

    public function userInvestments(Request $request): Response
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:active,completed,cancelled',
            'export' => 'nullable|in:pdf,csv',
        ]);

        $query = Investment::with(['user', 'propertyProject', 'plot']);

        if ($validated['user_id']) {
            $query->where('user_id', $validated['user_id']);
        }

        if ($validated['start_date']) {
            $query->where('investment_date', '>=', $validated['start_date']);
        }

        if ($validated['end_date']) {
            $query->where('investment_date', '<=', $validated['end_date']);
        }

        if ($validated['status']) {
            $query->where('status', $validated['status']);
        }

        $investments = $query->orderBy('investment_date', 'desc')->get();

        if ($validated['export'] === 'pdf') {
            return $this->exportUserInvestmentsPDF($investments, $validated);
        } elseif ($validated['export'] === 'csv') {
            return $this->exportUserInvestmentsCSV($investments, $validated);
        }

        $summary = $this->getUserInvestmentSummary($investments);

        return Inertia::render('Reports/UserInvestments', [
            'investments' => $investments,
            'summary' => $summary,
            'filters' => $validated,
        ]);
    }

    public function teamPerformance(Request $request): Response
    {
        $validated = $request->validate([
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'export' => 'nullable|in:pdf,csv',
        ]);

        $query = Team::with(['teamMembers.user', 'teamMembers.investments', 'teamMembers.profits']);

        if ($validated['team_id']) {
            $query->where('id', $validated['team_id']);
        }

        $teams = $query->get();

        $teamReports = $teams->map(function ($team) use ($validated) {
            $teamData = $this->getTeamPerformanceData($team, $validated);
            
            return [
                'team' => $team,
                'performance' => $teamData,
                'members' => $team->teamMembers->map(function ($member) {
                    return [
                        'member' => $member->user,
                        'investments' => $member->investments,
                        'profits' => $member->profits,
                        'performance' => $this->getMemberPerformanceData($member),
                    ];
                }),
            ];
        });

        if ($validated['export'] === 'pdf') {
            return $this->exportTeamPerformancePDF($teamReports, $validated);
        } elseif ($validated['export'] === 'csv') {
            return $this->exportTeamPerformanceCSV($teamReports, $validated);
        }

        $summary = $this->getTeamPerformanceSummary($teamReports);

        return Inertia::render('Reports/TeamPerformance', [
            'teamReports' => $teamReports,
            'summary' => $summary,
            'filters' => $validated,
        ]);
    }

    public function projectProfitability(Request $request): Response
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:property_projects,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'export' => 'nullable|in:pdf,csv',
        ]);

        $query = PropertyProject::with(['investments', 'sales', 'profits', 'plots']);

        if ($validated['project_id']) {
            $query->where('id', $validated['project_id']);
        }

        if ($validated['start_date']) {
            $query->where('created_at', '>=', $validated['start_date']);
        }

        if ($validated['end_date']) {
            $query->where('created_at', '<=', $validated['end_date']);
        }

        $projects = $query->get();

        $projectReports = $projects->map(function ($project) {
            return [
                'project' => $project,
                'profitability' => $this->getProjectProfitabilityData($project),
                'investments' => $project->investments->groupBy('user_id'),
                'sales' => $project->sales,
                'profits' => $project->profits,
            ];
        });

        if ($validated['export'] === 'pdf') {
            return $this->exportProjectProfitabilityPDF($projectReports, $validated);
        } elseif ($validated['export'] === 'csv') {
            return $this->exportProjectProfitabilityCSV($projectReports, $validated);
        }

        $summary = $this->getProjectProfitabilitySummary($projectReports);

        return Inertia::render('Reports/ProjectProfitability', [
            'projectReports' => $projectReports,
            'summary' => $summary,
            'filters' => $validated,
        ]);
    }

    public function walletTransactions(Request $request): Response
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'wallet_id' => 'nullable|exists:wallets,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'transaction_type' => 'nullable|in:deposit,withdrawal,investment,profit,reinvestment',
            'status' => 'nullable|in:pending,completed,failed',
            'export' => 'nullable|in:pdf,csv',
        ]);

        $query = Transaction::with(['user', 'wallet']);

        if ($validated['user_id']) {
            $query->where('user_id', $validated['user_id']);
        }

        if ($validated['wallet_id']) {
            $query->where('wallet_id', $validated['wallet_id']);
        }

        if ($validated['start_date']) {
            $query->where('created_at', '>=', $validated['start_date']);
        }

        if ($validated['end_date']) {
            $query->where('created_at', '<=', $validated['end_date']);
        }

        if ($validated['transaction_type']) {
            $query->where('type', $validated['transaction_type']);
        }

        if ($validated['status']) {
            $query->where('status', $validated['status']);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        if ($validated['export'] === 'pdf') {
            return $this->exportWalletTransactionsPDF($transactions, $validated);
        } elseif ($validated['export'] === 'csv') {
            return $this->exportWalletTransactionsCSV($transactions, $validated);
        }

        $summary = $this->getWalletTransactionSummary($transactions);

        return Inertia::render('Reports/WalletTransactions', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $validated,
        ]);
    }

    public function legalApprovals(Request $request): Response
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:property_projects,id',
            'approval_type' => 'nullable|in:legal,government,tsp',
            'status' => 'nullable|in:pending,approved,rejected',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'export' => 'nullable|in:pdf,csv',
        ]);

        $query = PropertyProject::with(['createdBy', 'approvedBy']);

        if ($validated['project_id']) {
            $query->where('id', $validated['project_id']);
        }

        if ($validated['start_date']) {
            $query->where('created_at', '>=', $validated['start_date']);
        }

        if ($validated['end_date']) {
            $query->where('created_at', '<=', $validated['end_date']);
        }

        if ($validated['approval_type']) {
            $query->where($validated['approval_type'] . '_approval_status', '!=', 'not_required');
        }

        if ($validated['status']) {
            if ($validated['approval_type']) {
                $query->where($validated['approval_type'] . '_approval_status', $validated['status']);
            } else {
                $query->where(function ($q) use ($validated) {
                    $q->where('legal_approval_status', $validated['status'])
                      ->orWhere('government_approval_status', $validated['status'])
                      ->orWhere('tsp_approval_status', $validated['status']);
                });
            }
        }

        $projects = $query->get();

        $approvalReports = $projects->map(function ($project) {
            return [
                'project' => $project,
                'legal_approval' => $this->getApprovalData($project, 'legal'),
                'government_approval' => $this->getApprovalData($project, 'government'),
                'tsp_approval' => $this->getApprovalData($project, 'tsp'),
            ];
        });

        if ($validated['export'] === 'pdf') {
            return $this->exportLegalApprovalsPDF($approvalReports, $validated);
        } elseif ($validated['export'] === 'csv') {
            return $this->exportLegalApprovalsCSV($approvalReports, $validated);
        }

        $summary = $this->getLegalApprovalsSummary($approvalReports);

        return Inertia::render('Reports/LegalApprovals', [
            'approvalReports' => $approvalReports,
            'summary' => $summary,
            'filters' => $validated,
        ]);
    }

    public function complianceReport(Request $request): Response
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'export' => 'nullable|in:pdf,csv',
        ]);

        $complianceData = $this->getComplianceData($validated);

        if ($validated['export'] === 'pdf') {
            return $this->exportCompliancePDF($complianceData, $validated);
        } elseif ($validated['export'] === 'csv') {
            return $this->exportComplianceCSV($complianceData, $validated);
        }

        return Inertia::render('Reports/Compliance', [
            'complianceData' => $complianceData,
            'filters' => $validated,
        ]);
    }

    // Helper Methods
    private function getAnalyticsDashboard(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        return [
            'overview' => [
                'total_users' => User::count(),
                'total_teams' => Team::count(),
                'total_projects' => PropertyProject::count(),
                'total_investments' => Investment::count(),
                'total_sales' => Sale::count(),
                'total_profits' => Profit::count(),
                'total_reinvestments' => Reinvestment::count(),
            ],
            'financials' => [
                'total_invested' => Investment::sum('amount'),
                'total_sales_revenue' => Sale::sum('sale_price'),
                'total_profits_distributed' => Profit::where('distribution_status', 'distributed')->sum('investor_share'),
                'total_reinvested' => Reinvestment::sum('amount'),
                'total_wallet_balance' => Wallet::sum('balance'),
            ],
            'today_metrics' => [
                'new_investments' => Investment::whereDate('investment_date', $today)->count(),
                'new_sales' => Sale::whereDate('sale_date', $today)->count(),
                'profits_distributed' => Profit::whereDate('distributed_at', $today)->count(),
                'reinvestments' => Reinvestment::whereDate('reinvestment_date', $today)->count(),
            ],
            'monthly_metrics' => [
                'new_investments' => Investment::where('investment_date', '>=', $thisMonth)->count(),
                'new_sales' => Sale::where('sale_date', '>=', $thisMonth)->count(),
                'profits_distributed' => Profit::where('distributed_at', '>=', $thisMonth)->count(),
                'reinvestments' => Reinvestment::where('reinvestment_date', '>=', $thisMonth)->count(),
            ],
            'yearly_metrics' => [
                'new_investments' => Investment::where('investment_date', '>=', $thisYear)->count(),
                'new_sales' => Sale::where('sale_date', '>=', $thisYear)->count(),
                'profits_distributed' => Profit::where('distributed_at', '>=', $thisYear)->count(),
                'reinvestments' => Reinvestment::where('reinvestment_date', '>=', $thisYear)->count(),
            ],
            'performance' => [
                'avg_investment_amount' => Investment::avg('amount'),
                'avg_sale_price' => Sale::avg('sale_price'),
                'avg_profit_amount' => Profit::avg('investor_share'),
                'avg_reinvestment_amount' => Reinvestment::avg('amount'),
            ],
            'status_breakdown' => [
                'active_projects' => PropertyProject::where('status', 'active')->count(),
                'pending_projects' => PropertyProject::where('status', 'pending')->count(),
                'completed_projects' => PropertyProject::where('status', 'completed')->count(),
                'active_investments' => Investment::where('status', 'active')->count(),
                'completed_investments' => Investment::where('status', 'completed')->count(),
                'pending_profits' => Profit::where('distribution_status', 'pending')->count(),
                'distributed_profits' => Profit::where('distribution_status', 'distributed')->count(),
            ],
        ];
    }

    private function getUserInvestmentSummary($investments): array
    {
        return [
            'total_investments' => $investments->count(),
            'total_amount' => $investments->sum('amount'),
            'avg_amount' => $investments->avg('amount'),
            'max_amount' => $investments->max('amount'),
            'min_amount' => $investments->min('amount'),
            'active_investments' => $investments->where('status', 'active')->count(),
            'completed_investments' => $investments->where('status', 'completed')->count(),
            'cancelled_investments' => $investments->where('status', 'cancelled')->count(),
            'unique_users' => $investments->pluck('user_id')->unique()->count(),
            'unique_projects' => $investments->pluck('property_project_id')->unique()->count(),
        ];
    }

    private function getTeamPerformanceData($team, $filters): array
    {
        $teamInvestments = $team->teamMembers->flatMap->investments;
        $teamProfits = $team->teamMembers->flatMap->profits;
        $teamReinvestments = $team->teamMembers->flatMap->reinvestments;

        if ($filters['start_date']) {
            $teamInvestments = $teamInvestments->where('investment_date', '>=', $filters['start_date']);
            $teamProfits = $teamProfits->where('distributed_at', '>=', $filters['start_date']);
            $teamReinvestments = $teamReinvestments->where('reinvestment_date', '>=', $filters['start_date']);
        }

        if ($filters['end_date']) {
            $teamInvestments = $teamInvestments->where('investment_date', '<=', $filters['end_date']);
            $teamProfits = $teamProfits->where('distributed_at', '<=', $filters['end_date']);
            $teamReinvestments = $teamReinvestments->where('reinvestment_date', '<=', $filters['end_date']);
        }

        $totalInvested = $teamInvestments->sum('amount');
        $totalProfits = $teamProfits->sum('investor_share');
        $totalReinvested = $teamReinvestments->sum('amount');

        return [
            'team_size' => $team->teamMembers->count(),
            'total_invested' => $totalInvested,
            'total_profits' => $totalProfits,
            'total_reinvested' => $totalReinvested,
            'roi_percentage' => $totalInvested > 0 ? round(($totalProfits / $totalInvested) * 100, 2) : 0,
            'reinvestment_rate' => $totalProfits > 0 ? round(($totalReinvested / $totalProfits) * 100, 2) : 0,
            'avg_investment_per_member' => $team->teamMembers->count() > 0 ? $totalInvested / $team->teamMembers->count() : 0,
            'avg_profit_per_member' => $team->teamMembers->count() > 0 ? $totalProfits / $team->teamMembers->count() : 0,
        ];
    }

    private function getMemberPerformanceData($member): array
    {
        $totalInvested = $member->investments->sum('amount');
        $totalProfits = $member->profits->sum('investor_share');
        $totalReinvested = $member->reinvestments->sum('amount');

        return [
            'total_invested' => $totalInvested,
            'total_profits' => $totalProfits,
            'total_reinvested' => $totalReinvested,
            'roi_percentage' => $totalInvested > 0 ? round(($totalProfits / $totalInvested) * 100, 2) : 0,
            'reinvestment_rate' => $totalProfits > 0 ? round(($totalReinvested / $totalProfits) * 100, 2) : 0,
            'investment_count' => $member->investments->count(),
            'profit_count' => $member->profits->count(),
            'reinvestment_count' => $member->reinvestments->count(),
        ];
    }

    private function getProjectProfitabilityData($project): array
    {
        $totalInvested = $project->investments->sum('amount');
        $totalRevenue = $project->sales->sum('sale_price');
        $totalCost = $project->total_cost;
        $totalProfit = $totalRevenue - $totalCost;
        $totalDistributedProfits = $project->profits->where('distribution_status', 'distributed')->sum('investor_share');

        return [
            'total_invested' => $totalInvested,
            'total_revenue' => $totalRevenue,
            'total_cost' => $totalCost,
            'total_profit' => $totalProfit,
            'total_distributed_profits' => $totalDistributedProfits,
            'profit_margin' => $totalRevenue > 0 ? round(($totalProfit / $totalRevenue) * 100, 2) : 0,
            'roi_percentage' => $totalInvested > 0 ? round(($totalDistributedProfits / $totalInvested) * 100, 2) : 0,
            'investment_count' => $project->investments->count(),
            'sales_count' => $project->sales->count(),
            'profit_count' => $project->profits->count(),
            'unique_investors' => $project->investments->pluck('user_id')->unique()->count(),
        ];
    }

    private function getWalletTransactionSummary($transactions): array
    {
        return [
            'total_transactions' => $transactions->count(),
            'total_amount' => $transactions->sum('amount'),
            'avg_amount' => $transactions->avg('amount'),
            'max_amount' => $transactions->max('amount'),
            'min_amount' => $transactions->min('amount'),
            'by_type' => $transactions->groupBy('type')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total_amount' => $group->sum('amount'),
                    'avg_amount' => $group->avg('amount'),
                ];
            }),
            'by_status' => $transactions->groupBy('status')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total_amount' => $group->sum('amount'),
                ];
            }),
            'unique_users' => $transactions->pluck('user_id')->unique()->count(),
        ];
    }

    private function getApprovalData($project, $type): array
    {
        $statusField = $type . '_approval_status';
        $approvedAtField = $type . '_approved_at';
        
        return [
            'status' => $project->$statusField,
            'approved_at' => $project->$approvedAtField,
            'approved_by' => $project->approvedBy,
            'days_to_approval' => $project->$approvedAtField ? 
                Carbon::parse($project->created_at)->diffInDays($project->$approvedAtField) : null,
        ];
    }

    private function getComplianceData($filters): array
    {
        $query = PropertyProject::query();

        if ($filters['start_date']) {
            $query->where('created_at', '>=', $filters['start_date']);
        }

        if ($filters['end_date']) {
            $query->where('created_at', '<=', $filters['end_date']);
        }

        $projects = $query->get();

        return [
            'total_projects' => $projects->count(),
            'approved_projects' => $projects->where('approval_status', 'approved')->count(),
            'pending_projects' => $projects->where('approval_status', 'pending')->count(),
            'rejected_projects' => $projects->where('approval_status', 'rejected')->count(),
            'legal_compliance' => [
                'total' => $projects->count(),
                'approved' => $projects->where('legal_approval_status', 'approved')->count(),
                'pending' => $projects->where('legal_approval_status', 'pending')->count(),
                'rejected' => $projects->where('legal_approval_status', 'rejected')->count(),
                'not_required' => $projects->where('legal_approval_status', 'not_required')->count(),
            ],
            'government_compliance' => [
                'total' => $projects->count(),
                'approved' => $projects->where('government_approval_status', 'approved')->count(),
                'pending' => $projects->where('government_approval_status', 'pending')->count(),
                'rejected' => $projects->where('government_approval_status', 'rejected')->count(),
                'not_required' => $projects->where('government_approval_status', 'not_required')->count(),
            ],
            'tsp_compliance' => [
                'total' => $projects->count(),
                'approved' => $projects->where('tsp_approval_status', 'approved')->count(),
                'pending' => $projects->where('tsp_approval_status', 'pending')->count(),
                'rejected' => $projects->where('tsp_approval_status', 'rejected')->count(),
                'not_required' => $projects->where('tsp_approval_status', 'not_required')->count(),
            ],
        ];
    }

    // Export Methods
    private function exportUserInvestmentsPDF($investments, $filters): Response
    {
        $pdf = PDF::loadView('reports.pdf.user_investments', [
            'investments' => $investments,
            'summary' => $this->getUserInvestmentSummary($investments),
            'filters' => $filters,
        ]);

        return $pdf->download('user_investments_report.pdf');
    }

    private function exportUserInvestmentsCSV($investments, $filters): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="user_investments_report.csv"',
        ];

        $callback = function () use ($investments) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'ID', 'User', 'Project', 'Plot', 'Amount', 'Type', 'Status', 'Date'
            ]);

            // Data
            foreach ($investments as $investment) {
                fputcsv($file, [
                    $investment->id,
                    $investment->user->name,
                    $investment->propertyProject->name,
                    $investment->plot->plot_number ?? 'N/A',
                    $investment->amount,
                    $investment->investment_type,
                    $investment->status,
                    $investment->investment_date->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportTeamPerformancePDF($teamReports, $filters): Response
    {
        $pdf = PDF::loadView('reports.pdf.team_performance', [
            'teamReports' => $teamReports,
            'summary' => $this->getTeamPerformanceSummary($teamReports),
            'filters' => $filters,
        ]);

        return $pdf->download('team_performance_report.pdf');
    }

    private function exportTeamPerformanceCSV($teamReports, $filters): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="team_performance_report.csv"',
        ];

        $callback = function () use ($teamReports) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'Team', 'Team Size', 'Total Invested', 'Total Profits', 'Total Reinvested', 'ROI %', 'Reinvestment Rate %'
            ]);

            // Data
            foreach ($teamReports as $report) {
                fputcsv($file, [
                    $report['team']->name,
                    $report['performance']['team_size'],
                    $report['performance']['total_invested'],
                    $report['performance']['total_profits'],
                    $report['performance']['total_reinvested'],
                    $report['performance']['roi_percentage'],
                    $report['performance']['reinvestment_rate'],
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportProjectProfitabilityPDF($projectReports, $filters): Response
    {
        $pdf = PDF::loadView('reports.pdf.project_profitability', [
            'projectReports' => $projectReports,
            'summary' => $this->getProjectProfitabilitySummary($projectReports),
            'filters' => $filters,
        ]);

        return $pdf->download('project_profitability_report.pdf');
    }

    private function exportProjectProfitabilityCSV($projectReports, $filters): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="project_profitability_report.csv"',
        ];

        $callback = function () use ($projectReports) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'Project', 'Total Invested', 'Total Revenue', 'Total Cost', 'Total Profit', 'Profit Margin %', 'ROI %'
            ]);

            // Data
            foreach ($projectReports as $report) {
                fputcsv($file, [
                    $report['project']->name,
                    $report['profitability']['total_invested'],
                    $report['profitability']['total_revenue'],
                    $report['profitability']['total_cost'],
                    $report['profitability']['total_profit'],
                    $report['profitability']['profit_margin'],
                    $report['profitability']['roi_percentage'],
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportWalletTransactionsPDF($transactions, $filters): Response
    {
        $pdf = PDF::loadView('reports.pdf.wallet_transactions', [
            'transactions' => $transactions,
            'summary' => $this->getWalletTransactionSummary($transactions),
            'filters' => $filters,
        ]);

        return $pdf->download('wallet_transactions_report.pdf');
    }

    private function exportWalletTransactionsCSV($transactions, $filters): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="wallet_transactions_report.csv"',
        ];

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'ID', 'User', 'Type', 'Amount', 'Balance Before', 'Balance After', 'Reference', 'Status', 'Date'
            ]);

            // Data
            foreach ($transactions as $transaction) {
                fputcsv($file, [
                    $transaction->id,
                    $transaction->user->name,
                    $transaction->type,
                    $transaction->amount,
                    $transaction->balance_before,
                    $transaction->balance_after,
                    $transaction->reference,
                    $transaction->status,
                    $transaction->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportLegalApprovalsPDF($approvalReports, $filters): Response
    {
        $pdf = PDF::loadView('reports.pdf.legal_approvals', [
            'approvalReports' => $approvalReports,
            'summary' => $this->getLegalApprovalsSummary($approvalReports),
            'filters' => $filters,
        ]);

        return $pdf->download('legal_approvals_report.pdf');
    }

    private function exportLegalApprovalsCSV($approvalReports, $filters): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="legal_approvals_report.csv"',
        ];

        $callback = function () use ($approvalReports) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'Project', 'Legal Status', 'Government Status', 'TSP Status', 'Overall Status', 'Created At', 'Approved At'
            ]);

            // Data
            foreach ($approvalReports as $report) {
                fputcsv($file, [
                    $report['project']->name,
                    $report['legal_approval']['status'],
                    $report['government_approval']['status'],
                    $report['tsp_approval']['status'],
                    $report['project']->approval_status,
                    $report['project']->created_at->format('Y-m-d'),
                    $report['project']->approved_at?->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportCompliancePDF($complianceData, $filters): Response
    {
        $pdf = PDF::loadView('reports.pdf.compliance', [
            'complianceData' => $complianceData,
            'filters' => $filters,
        ]);

        return $pdf->download('compliance_report.pdf');
    }

    private function exportComplianceCSV($complianceData, $filters): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="compliance_report.csv"',
        ];

        $callback = function () use ($complianceData) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'Compliance Type', 'Total', 'Approved', 'Pending', 'Rejected', 'Not Required'
            ]);

            // Data
            fputcsv($file, [
                'Legal Compliance',
                $complianceData['legal_compliance']['total'],
                $complianceData['legal_compliance']['approved'],
                $complianceData['legal_compliance']['pending'],
                $complianceData['legal_compliance']['rejected'],
                $complianceData['legal_compliance']['not_required'],
            ]);

            fputcsv($file, [
                'Government Compliance',
                $complianceData['government_compliance']['total'],
                $complianceData['government_compliance']['approved'],
                $complianceData['government_compliance']['pending'],
                $complianceData['government_compliance']['rejected'],
                $complianceData['government_compliance']['not_required'],
            ]);

            fputcsv($file, [
                'TSP Compliance',
                $complianceData['tsp_compliance']['total'],
                $complianceData['tsp_compliance']['approved'],
                $complianceData['tsp_compliance']['pending'],
                $complianceData['tsp_compliance']['rejected'],
                $complianceData['tsp_compliance']['not_required'],
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getTeamPerformanceSummary($teamReports): array
    {
        return [
            'total_teams' => $teamReports->count(),
            'total_members' => $teamReports->sum(function ($report) {
                return $report['performance']['team_size'];
            }),
            'total_invested' => $teamReports->sum(function ($report) {
                return $report['performance']['total_invested'];
            }),
            'total_profits' => $teamReports->sum(function ($report) {
                return $report['performance']['total_profits'];
            }),
            'total_reinvested' => $teamReports->sum(function ($report) {
                return $report['performance']['total_reinvested'];
            }),
            'avg_roi' => $teamReports->avg(function ($report) {
                return $report['performance']['roi_percentage'];
            }),
            'avg_reinvestment_rate' => $teamReports->avg(function ($report) {
                return $report['performance']['reinvestment_rate'];
            }),
        ];
    }

    private function getProjectProfitabilitySummary($projectReports): array
    {
        return [
            'total_projects' => $projectReports->count(),
            'total_invested' => $projectReports->sum(function ($report) {
                return $report['profitability']['total_invested'];
            }),
            'total_revenue' => $projectReports->sum(function ($report) {
                return $report['profitability']['total_revenue'];
            }),
            'total_cost' => $projectReports->sum(function ($report) {
                return $report['profitability']['total_cost'];
            }),
            'total_profit' => $projectReports->sum(function ($report) {
                return $report['profitability']['total_profit'];
            }),
            'avg_profit_margin' => $projectReports->avg(function ($report) {
                return $report['profitability']['profit_margin'];
            }),
            'avg_roi' => $projectReports->avg(function ($report) {
                return $report['profitability']['roi_percentage'];
            }),
        ];
    }

    private function getLegalApprovalsSummary($approvalReports): array
    {
        return [
            'total_projects' => $approvalReports->count(),
            'approved_projects' => $approvalReports->where('project.approval_status', 'approved')->count(),
            'pending_projects' => $approvalReports->where('project.approval_status', 'pending')->count(),
            'rejected_projects' => $approvalReports->where('project.approval_status', 'rejected')->count(),
            'legal_approved' => $approvalReports->where('legal_approval.status', 'approved')->count(),
            'government_approved' => $approvalReports->where('government_approval.status', 'approved')->count(),
            'tsp_approved' => $approvalReports->where('tsp_approval.status', 'approved')->count(),
        ];
    }
}
