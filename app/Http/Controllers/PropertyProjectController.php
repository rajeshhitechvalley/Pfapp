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
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class PropertyProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PropertyProject::with(['createdBy', 'updatedBy', 'approvedBy'])
            ->withCount(['plots', 'sales', 'investments']);
        
        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }
        
        if ($request->has('development_phase')) {
            $query->where('development_phase', $request->development_phase);
        }
        
        $projects = $query->orderBy('created_at', 'desc')->paginate(20);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $projects
            ]);
        }

        return Inertia::render('PropertyProjects/Index', [
            'projects' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
            ],
            'filters' => $request->only(['status', 'type', 'location', 'development_phase'])
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('PropertyProjects/Create', [
            'projectTypes' => ['Land', 'Residential', 'Commercial', 'Resort', 'Hotel', 'Farmhouse'],
            'developmentPhases' => [
                'land_acquisition' => 'Land Acquisition',
                'legal_approvals' => 'Legal Approvals',
                'planning' => 'Planning',
                'infrastructure' => 'Infrastructure Development',
                'amenities' => 'Amenities Development',
                'handover' => 'Handover Ready'
            ],
            'projectStatuses' => [
                'Planned',
                'Land Acquired',
                'Legal in Progress',
                'Approved',
                'Under Development',
                'Ready for Sale',
                'Completed',
                'Closed'
            ],
            'approvalStatuses' => ['pending', 'approved', 'rejected'],
            'legalStatuses' => ['pending', 'applied', 'under_review', 'approved', 'rejected'],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:Land,Residential,Commercial,Resort,Hotel,Farmhouse',
            'location' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'pincode' => 'required|string|max:10',
            'total_area' => 'required|numeric|min:0',
            'total_plots' => 'required|integer|min:1',
            'price_per_plot' => 'required|numeric|min:0',
            'expected_roi' => 'required|numeric|min:0|max:100',
            'projected_completion_date' => 'required|date|after:today',
            'status' => 'required|in:pl,la,lp,ap,ud,rs,cm,cl',
            'development_phase' => 'required|in:land_acquisition,legal_approvals,planning,infrastructure,amenities,handover',
            
            // REQ-PM-002: Large Land Purchase Entry
            'seller_name' => 'required|string|max:255',
            'seller_contact' => 'required|string|max:255',
            'seller_address' => 'required|string',
            'survey_numbers' => 'required|string',
            'registration_number' => 'required|string|max:255',
            'registration_date' => 'required|date',
            'land_purchase_date' => 'required|date',
            'payment_terms' => 'required|string',
            'payment_schedule' => 'nullable|array',
            'land_purchase_cost' => 'required|numeric|min:0',
            
            // Cost Details
            'legal_cost' => 'nullable|numeric|min:0',
            'development_cost' => 'nullable|numeric|min:0',
            'construction_cost' => 'nullable|numeric|min:0',
            'marketing_cost' => 'nullable|numeric|min:0',
            'admin_cost' => 'nullable|numeric|min:0',
            'infrastructure_cost' => 'nullable|numeric|min:0',
            'budget_cost' => 'nullable|numeric|min:0',
            
            // REQ-PM-003: Legal Approval Tracking - TSP
            'tsp_application_date' => 'nullable|date',
            'tsp_application_number' => 'nullable|string|max:255',
            'tsp_approval_status' => 'nullable|in:applied,under_review,approved,rejected',
            
            // REQ-PM-005: Plotting & Layout Management
            'layout_blueprint' => 'nullable|file|mimes:pdf,dwg,dxf|max:10240',
            'plot numbering_scheme' => 'nullable|string',
            'road_width' => 'nullable|numeric|min:0',
            'open_space_percentage' => 'nullable|numeric|min:0|max:100',
            'amenity_area' => 'nullable|numeric|min:0',
            
            // Additional Details
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'google_maps_link' => 'nullable|url',
            'nearby_landmarks' => 'nullable|string',
            'connectivity' => 'nullable|string',
            'special_features' => 'nullable|array',
            'terms_and_conditions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Calculate total values
            $totalCost = ($request->land_purchase_cost) + 
                         ($request->legal_cost ?? 0) + 
                         ($request->development_cost ?? 0) + 
                         ($request->construction_cost ?? 0) + 
                         ($request->marketing_cost ?? 0) + 
                         ($request->admin_cost ?? 0) + 
                         ($request->infrastructure_cost ?? 0);
            
            $totalValue = $request->total_plots * $request->price_per_plot;

            // Handle file uploads
            $featuredImagePath = null;
            if ($request->hasFile('featured_image')) {
                $featuredImagePath = $request->file('featured_image')->store('projects/featured', 'public');
            }

            $galleryImages = [];
            if ($request->hasFile('gallery_images')) {
                foreach ($request->file('gallery_images') as $image) {
                    $galleryImages[] = $image->store('projects/gallery', 'public');
                }
            }

            $layoutBlueprintPath = null;
            if ($request->hasFile('layout_blueprint')) {
                $layoutBlueprintPath = $request->file('layout_blueprint')->store('projects/blueprints', 'public');
            }

            // Create project
            $project = PropertyProject::create([
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'location' => $request->location,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,
                'pincode' => $request->pincode,
                'total_area' => $request->total_area,
                'total_plots' => $request->total_plots,
                'available_plots' => $request->total_plots,
                'sold_plots' => 0,
                'held_plots' => 0,
                'price_per_plot' => $request->price_per_plot,
                'total_value' => $totalValue,
                'expected_roi' => $request->expected_roi,
                'projected_completion_date' => $request->projected_completion_date,
                'status' => $request->status,
                'development_phase' => $request->development_phase,
                'approval_status' => 'pending',
                'created_by' => auth()->id(),
                
                // REQ-PM-002: Large Land Purchase Entry
                'seller_name' => $request->seller_name,
                'seller_contact' => $request->seller_contact,
                'seller_address' => $request->seller_address,
                'survey_numbers' => $request->survey_numbers,
                'registration_number' => $request->registration_number,
                'registration_date' => $request->registration_date,
                'land_purchase_date' => $request->land_purchase_date,
                'payment_terms' => $request->payment_terms,
                'payment_schedule' => $request->payment_schedule,
                'land_purchase_cost' => $request->land_purchase_cost,
                
                // REQ-PM-007: Project Cost Tracking
                'legal_cost' => $request->legal_cost,
                'development_cost' => $request->development_cost,
                'construction_cost' => $request->construction_cost,
                'marketing_cost' => $request->marketing_cost,
                'admin_cost' => $request->admin_cost,
                'infrastructure_cost' => $request->infrastructure_cost,
                'total_cost' => $totalCost,
                'budget_cost' => $request->budget_cost ?? $totalCost,
                
                // REQ-PM-003: Legal Approval Tracking - TSP
                'tsp_application_date' => $request->tsp_application_date,
                'tsp_application_number' => $request->tsp_application_number,
                'tsp_approval_status' => $request->tsp_approval_status ?? 'applied',
                
                // REQ-PM-005: Plotting & Layout Management
                'layout_blueprint' => $layoutBlueprintPath,
                'plot_numbering_scheme' => $request->input('plot_numbering_scheme'),
                'road_width' => $request->road_width,
                'open_space_percentage' => $request->open_space_percentage,
                'amenity_area' => $request->amenity_area,
                
                // REQ-PM-011: Project Gallery Management
                'featured_image' => $featuredImagePath,
                'gallery_images' => $galleryImages,
                
                // Additional Details
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'google_maps_link' => $request->google_maps_link,
                'nearby_landmarks' => $request->nearby_landmarks,
                'connectivity' => $request->connectivity,
                'special_features' => $request->special_features,
                'terms_and_conditions' => $request->terms_and_conditions,
                
                // Generate unique project code
                'project_code' => 'PRJ' . strtoupper(uniqid()),
            ]);

            // Create plots if requested
            if ($request->create_plots) {
                $this->createProjectPlots($project, $request);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Project created successfully',
                'data' => $project->load(['plots', 'createdBy'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create project: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse|Response
    {
        $project = PropertyProject::with([
            'plots', 
            'sales', 
            'createdBy', 
            'approvedBy',
            'investments'
        ])->findOrFail($id);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'project' => $project,
                    'reports' => $project->getProjectReports()
                ]
            ]);
        }

        return Inertia::render('PropertyProjects/Show', [
            'project' => $project,
            'reports' => $project->getProjectReports()
        ]);
    }

    public function edit(string $id): Response
    {
        $project = PropertyProject::findOrFail($id);
        
        if (!$project->canEdit()) {
            return redirect()->back()->with('error', 'This project cannot be edited in its current status');
        }

        return Inertia::render('PropertyProjects/Edit', [
            'project' => $project,
            'projectTypes' => ['Land', 'Residential', 'Commercial', 'Resort', 'Hotel', 'Farmhouse'],
            'developmentPhases' => [
                'land_acquisition' => 'Land Acquisition',
                'legal_approvals' => 'Legal Approvals',
                'planning' => 'Planning',
                'infrastructure' => 'Infrastructure Development',
                'amenities' => 'Amenities Development',
                'handover' => 'Handover Ready'
            ],
            'projectStatuses' => [
                'Planned',
                'Land Acquired',
                'Legal in Progress',
                'Approved',
                'Under Development',
                'Ready for Sale',
                'Completed',
                'Closed'
            ],
            'approvalStatuses' => ['pending', 'approved', 'rejected'],
            'legalStatuses' => ['pending', 'applied', 'under_review', 'approved', 'rejected'],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
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
            'status' => 'required|in:ac,in,cm,ca,ho',
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
