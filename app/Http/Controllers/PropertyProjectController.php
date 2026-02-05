<?php

namespace App\Http\Controllers;

use App\Models\PropertyProject;
use App\Models\Plot;
use App\Models\Sale;
use App\Models\Investment;
use App\Models\Profit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PropertyProjectController extends Controller
{
    public function index(): Response
    {
        $projects = PropertyProject::with(['createdBy', 'updatedBy', 'approvedBy'])
            ->withCount(['plots', 'sales', 'investments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('PropertyProjects/Index', [
            'projects' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
            ]
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('PropertyProjects/Create');
    }

    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:land,resort,hotel,farmhouse,commercial,residential',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'total_area' => 'required|numeric|min:0',
            'total_plots' => 'required|integer|min:1',
            'price_per_plot' => 'required|numeric|min:0',
            'development_cost' => 'nullable|numeric|min:0',
            'legal_cost' => 'nullable|numeric|min:0',
            'marketing_cost' => 'nullable|numeric|min:0',
            'infrastructure_cost' => 'nullable|numeric|min:0',
            'expected_roi' => 'nullable|numeric|min:0|max:100',
            'projected_completion_date' => 'nullable|date|after:today',
        ]);

        $validated['total_value'] = $validated['total_plots'] * $validated['price_per_plot'];
        $validated['total_cost'] = ($validated['development_cost'] ?? 0) + 
                                     ($validated['legal_cost'] ?? 0) + 
                                     ($validated['marketing_cost'] ?? 0) + 
                                     ($validated['infrastructure_cost'] ?? 0);
        $validated['created_by'] = Auth::id();

        $project = PropertyProject::create($validated);

        // Create plots for the project
        $this->createPlotsForProject($project->id, $validated['total_plots']);

        return redirect()->route('property-projects.show', $project->id)
            ->with('success', 'Property project created successfully.');
    }

    public function show(PropertyProject $project): Response
    {
        $project->load([
            'plots',
            'sales',
            'investments',
            'profits',
            'createdBy',
            'updatedBy',
            'approvedBy'
        ]);

        return Inertia::render('PropertyProjects/Show', [
            'project' => $project,
            'development_status' => $project->getDevelopmentStatus(),
            'legal_approvals' => $project->getLegalApprovals(),
            'financial_summary' => $project->getFinancialSummary(),
        ]);
    }

    public function edit(PropertyProject $project): Response
    {
        return Inertia::render('PropertyProjects/Edit', [
            'project' => $project
        ]);
    }

    public function update(Request $request, PropertyProject $project): Response
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:land,resort,hotel,farmhouse,commercial,residential',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'total_area' => 'nullable|numeric|min:0',
            'total_plots' => 'required|integer|min:1',
            'price_per_plot' => 'required|numeric|min:0',
            'development_cost' => 'nullable|numeric|min:0',
            'legal_cost' => 'nullable|numeric|min:0',
            'marketing_cost' => 'nullable|numeric|min:0',
            'infrastructure_cost' => 'nullable|numeric|min:0',
            'expected_roi' => 'nullable|numeric|min:0|max:100',
            'projected_completion_date' => 'nullable|date|after:today',
        ]);

        $validated['total_value'] = $validated['total_plots'] * $validated['price_per_plot'];
        $validated['total_cost'] = ($validated['development_cost'] ?? 0) + 
                                     ($validated['legal_cost'] ?? 0) + 
                                     ($validated['marketing_cost'] ?? 0) + 
                                     ($validated['infrastructure_cost'] ?? 0);
        $validated['updated_by'] = Auth::id();

        $project->update($validated);

        return redirect()->route('property-projects.show', $project->id)
            ->with('success', 'Property project updated successfully.');
    }

    public function approve(Request $request, PropertyProject $project): Response
    {
        $validated = $request->validate([
            'approval_notes' => 'nullable|string',
        ]);

        if ($project->approve(Auth::id())) {
            return redirect()->back()
                ->with('success', 'Property project approved successfully.');
        }

        return redirect()->back()
            ->with('error', 'Property project cannot be approved.');
    }

    public function reject(Request $request, PropertyProject $project): Response
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($project->reject($validated['rejection_reason'], Auth::id())) {
            return redirect()->back()
                ->with('success', 'Property project rejected successfully.');
        }

        return redirect()->back()
            ->with('error', 'Property project cannot be rejected.');
    }

    public function updateProgress(Request $request, PropertyProject $project): Response
    {
        $validated = $request->validate([
            'sold_plots' => 'required|integer|min:0|max:' . $project->total_plots,
            'available_plots' => 'required|integer|min:0',
            'status' => 'required|in:pending,active,completed,cancelled,on_hold',
            'actual_completion_date' => 'nullable|date',
        ]);

        $project->updateProgress($validated['sold_plots'], $validated['available_plots']);

        return redirect()->back()
            ->with('success', 'Project progress updated successfully.');
    }

    public function uploadDocument(Request $request, PropertyProject $project): Response
    {
        $validated = $request->validate([
            'document_type' => 'required|in:legal,government,tsp,marketing,technical',
            'document' => 'required|file|mimes:pdf,doc,doc,jpg,jpeg,png|max:10240',
            'description' => 'nullable|string|max:1000',
        ]);

        $documentPath = $request->file('document')->store('property-documents', 'public');
        
        // Store document metadata
        DB::table('project_documents')->insert([
            'property_project_id' => $project->id,
            'document_type' => $validated['document_type'],
            'document_path' => $documentPath,
            'description' => $validated['description'],
            'uploaded_by' => Auth::id(),
            'created_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Document uploaded successfully.');
    }

    public function getDocuments(PropertyProject $project): Response
    {
        $documents = DB::table('project_documents')
            ->where('property_project_id', $project->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    public function downloadDocument($documentId): Response
    {
        $document = DB::table('project_documents')->find($documentId);
        
        if (!$document) {
            abort(404);
        }

        $filePath = storage_path('app/public/' . $document->document_path);
        
        if (!file_exists($filePath)) {
            abort(404);
        }

        return response()->download($filePath, $document->document_path);
    }

    public function getAnalytics(PropertyProject $project): Response
    {
        $analytics = [
            'project_overview' => $project->getFinancialSummary(),
            'development_progress' => $project->getDevelopmentStatus(),
            'legal_approvals' => $project->getLegalApprovals(),
            'investment_breakdown' => $this->getInvestmentBreakdown($project),
            'sales_performance' => $this->getSalesPerformance($project),
            'profitability_analysis' => $project->calculateProfitability(),
            'timeline_milestones' => $this->getTimelineMilestones($project),
        ];

        return response()->json($analytics);
    }

    public function getReport(PropertyProject $project): Response
    {
        $reportData = [
            'project_details' => $project->toArray(),
            'plots_summary' => $project->plots()->selectRaw('
                COUNT(*) as total_plots,
                SUM(CASE WHEN status = "available" THEN 1 ELSE 0 END) as available_plots,
                SUM(CASE WHEN status = "sold" THEN 1 ELSE 0 END) as sold_plots
            ')->first(),
            'sales_summary' => $project->sales()->selectRaw('
                COUNT(*) as total_sales,
                SUM(sale_price) as total_revenue,
                AVG(sale_price) as avg_sale_price
            ')->first(),
            'investment_summary' => $project->investments()->selectRaw('
                COUNT(*) as total_investments,
                SUM(amount) as total_invested,
                AVG(amount) as avg_investment
            ')->first(),
            'profit_summary' => $project->profits()->selectRaw('
                COUNT(*) as total_profits,
                SUM(investor_share) as total_investor_profits,
                SUM(company_share) as total_company_profits,
                AVG(investor_share) as avg_investor_profit
            ')->first(),
        ];

        return response()->json($reportData);
    }

    // Helper Methods
    private function createPlotsForProject(int $projectId, int $totalPlots): void
    {
        $plots = [];
        for ($i = 1; $i <= $totalPlots; $i++) {
            $plots[] = [
                'property_project_id' => $projectId,
                'plot_number' => str_pad($i, 4, '0', STR_PAD_LEFT),
                'area' => 500, // Default area in sq ft
                'status' => 'available',
                'price' => 0, // Will be set based on project price_per_plot
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Plot::insert($plots);
    }

    private function getInvestmentBreakdown(PropertyProject $project): array
    {
        $investments = $project->investments()
            ->selectRaw('
                investment_type,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount
            ')
            ->groupBy('investment_type')
            ->get();

        return $investments->toArray();
    }

    private function getSalesPerformance(PropertyProject $project): array
    {
        $sales = $project->sales()
            ->selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                COUNT(*) as sales_count,
                SUM(sale_price) as total_revenue,
                AVG(sale_price) as avg_price
            ')
            ->groupByRaw('DATE_FORMAT(created_at, "%Y-%m")')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return $sales->toArray();
    }

    private function getTimelineMilestones(PropertyProject $project): array
    {
        $milestones = [
            [
                'title' => 'Project Initiation',
                'description' => 'Project created and initial planning',
                'status' => 'completed',
                'date' => $project->created_at->format('Y-m-d'),
            ],
            [
                'title' => 'Legal Approvals',
                'description' => 'All legal and government approvals obtained',
                'status' => $project->approved_at ? 'completed' : 'pending',
                'date' => $project->approved_at?->format('Y-m-d') : null,
            ],
            [
                'title' => 'Development Start',
                'description' => 'Physical development work begins',
                'status' => $project->status === 'active' ? 'in_progress' : 'pending',
                'date' => $project->status === 'active' ? now()->format('Y-m-d') : null,
            ],
            [
                'title' => 'Project Completion',
                'description' => 'All plots sold and project completed',
                'status' => $project->status === 'completed' ? 'completed' : 'pending',
                'date' => $project->actual_completion_date?->format('Y-m-d') : null,
            ]
        ];

        return $milestones;
    }
}
