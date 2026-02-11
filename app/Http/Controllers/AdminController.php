<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\Investment;
use App\Models\Property;
use App\Models\PropertyProject;
use App\Models\Plot;
use App\Models\Sale;
use App\Models\Profit;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\AdminConfiguration;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminController extends Controller
{
    public function dashboard(): InertiaResponse
    {
        // Get dashboard statistics
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'pending_users' => User::where('status', 'inactive')->count(),
            'total_teams' => Team::count(),
            'active_teams' => Team::where('status', 'active')->count(),
            'pending_teams' => Team::where('status', 'pending')->count(),
            'total_investments' => Investment::count(),
            'total_invested_amount' => Investment::where('status', 'approved')->sum('amount'),
            'total_wallet_balance' => Wallet::sum('balance'),
            'total_properties' => Property::count(),
            'total_plots' => Plot::count(),
            'available_plots' => Plot::where('status', 'available')->count(),
            'sold_plots' => Plot::where('status', 'sold')->count(),
            'total_sales' => Sale::count(),
            'total_sales_amount' => Sale::sum('sale_price'),
            'total_profits' => Profit::sum('investor_share'),
            'total_company_profit' => Profit::sum('company_share'),
        ];

        // Get recent activities
        $recentUsers = User::with('wallet')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentInvestments = Investment::with(['user', 'property', 'plot'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentTransactions = Transaction::with(['user', 'wallet'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $recentSales = Sale::with(['plot', 'property'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get monthly statistics for charts
        $monthlyStats = $this->getMonthlyStatistics();

        // Get top performers
        $topInvestors = User::with(['wallet', 'investments'])
            ->whereHas('investments')
            ->withSum('investments', 'amount')
            ->orderByDesc('investments_sum_amount')
            ->take(5)
            ->get();

        $topTeams = Team::with(['teamLeader', 'teamMembers'])
            ->withSum('teamMembers', 'investment_amount')
            ->orderByDesc('team_members_sum_investment_amount')
            ->take(5)
            ->get();

        // Get property performance
        $propertyPerformance = Property::with(['plots', 'sales'])
            ->withCount(['plots', 'sales'])
            ->withSum('sales', 'sale_price')
            ->orderByDesc('sales_sum_sale_price')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentInvestments' => $recentInvestments,
            'recentTransactions' => $recentTransactions,
            'recentSales' => $recentSales,
            'monthlyStats' => $monthlyStats,
            'topInvestors' => $topInvestors,
            'topTeams' => $topTeams,
            'propertyPerformance' => $propertyPerformance,
        ]);
    }

    public function users(): InertiaResponse
    {
        $users = User::with(['wallet', 'ledTeam', 'teamMemberships'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Users', [
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

    public function teams(): InertiaResponse
    {
        $teams = Team::with(['teamLeader', 'teamMembers.user'])
            ->withCount(['teamMembers'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Add additional members from users.team_id for each team
        $teams->getCollection()->transform(function ($teamItem) {
            // Get users assigned via users.team_id (excluding team leader)
            $assignedUsers = \App\Models\User::where('team_id', $teamItem->id)
                ->where('id', '!=', $teamItem->team_leader_id)
                ->get()
                ->map(function ($user) use ($teamItem) {
                    return (object) [
                        'id' => 'user_' . $user->id, // Unique ID to avoid conflicts
                        'user_id' => $user->id,
                        'team_id' => $teamItem->id,
                        'status' => 'assigned',
                        'joined_at' => $user->updated_at,
                        'user' => $user
                    ];
                });

            // Combine team_members and assigned users
            $allMembers = $teamItem->teamMembers->concat($assignedUsers);
            
            // Update member_count to reflect actual total
            $teamItem->member_count = $allMembers->count();
            
            // Replace the teamMembers relationship
            $teamItem->setRelation('teamMembers', $allMembers);
            
            return $teamItem;
        });

        return Inertia::render('Admin/Teams', [
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

    public function showTeam($id): InertiaResponse
    {
        $team = Team::with(['teamLeader', 'teamMembers.user'])
            ->withCount(['teamMembers'])
            ->findOrFail($id);

        // Add additional members from users.team_id for this team
        $assignedUsers = \App\Models\User::where('team_id', $team->id)
            ->where('id', '!=', $team->team_leader_id)
            ->get()
            ->map(function ($user) use ($team) {
                return (object) [
                    'id' => 'user_' . $user->id,
                    'user_id' => $user->id,
                    'team_id' => $team->id,
                    'status' => 'assigned',
                    'joined_at' => $user->updated_at,
                    'user' => $user
                ];
            });

        // Combine team_members and assigned users
        $allMembers = $team->teamMembers->concat($assignedUsers);
        
        // Create a custom array representation for Inertia
        $teamArray = $team->toArray();
        $teamArray['teamMembers'] = $allMembers->map(function ($member) {
            return [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'team_id' => $member->team_id,
                'status' => $member->status,
                'joined_at' => $member->joined_at,
                'user' => $member->user->toArray()
            ];
        })->toArray();

        return Inertia::render('Admin/Teams/Show', [
            'team' => $teamArray
        ]);
    }

    public function editTeam($id): InertiaResponse
    {
        $team = Team::with(['teamLeader', 'teamMembers.user'])
            ->withCount(['teamMembers'])
            ->findOrFail($id);

        // Add additional members from users.team_id for this team
        $assignedUsers = \App\Models\User::where('team_id', $team->id)
            ->where('id', '!=', $team->team_leader_id)
            ->get()
            ->map(function ($user) use ($team) {
                return (object) [
                    'id' => 'user_' . $user->id,
                    'user_id' => $user->id,
                    'team_id' => $team->id,
                    'status' => 'assigned',
                    'joined_at' => $user->updated_at,
                    'user' => $user
                ];
            });

        // Combine team_members and assigned users
        $allMembers = $team->teamMembers->concat($assignedUsers);
        
        // Create a custom array representation for Inertia
        $teamArray = $team->toArray();
        $teamArray['teamMembers'] = $allMembers->map(function ($member) {
            return [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'team_id' => $member->team_id,
                'status' => $member->status,
                'joined_at' => $member->joined_at,
                'user' => $member->user->toArray()
            ];
        })->toArray();

        return Inertia::render('Admin/Teams/Edit', [
            'team' => $teamArray
        ]);
    }

    public function removeTeamMember(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $team = Team::findOrFail($id);
        $user = User::findOrFail($request->user_id);

        // Remove from team_members table if exists
        $teamMember = \App\Models\TeamMember::where('team_id', $team->id)
            ->where('user_id', $user->id)
            ->first();
        
        if ($teamMember) {
            $teamMember->delete();
        }

        // Remove from users.team_id if assigned
        if ($user->team_id == $team->id) {
            $user->team_id = null;
            $user->save();
        }

        return redirect()->back()->with('success', 'Member removed from team successfully');
    }

    public function toggleMemberStatus(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:active,inactive'
        ]);

        $team = Team::findOrFail($id);
        $user = User::findOrFail($request->user_id);

        // Update status in team_members table if exists
        $teamMember = \App\Models\TeamMember::where('team_id', $team->id)
            ->where('user_id', $user->id)
            ->first();
        
        if ($teamMember) {
            $teamMember->status = $request->status;
            $teamMember->save();
        }

        return redirect()->back()->with('success', 'Member status updated successfully');
    }

    public function investments(): InertiaResponse
    {
        $investments = Investment::with(['user', 'property', 'plot'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Investments', [
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

    public function transactions(): InertiaResponse
    {
        $transactions = Transaction::with(['user', 'wallet', 'investment'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'from' => $transactions->firstItem(),
                'to' => $transactions->lastItem(),
            ]
        ]);
    }

    public function createTransaction(): InertiaResponse
    {
        $users = \App\Models\User::with('wallet')
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $paymentMethods = \App\Models\PaymentMethod::where('status', 'active')
            ->select('id', 'name', 'type', 'status')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Transactions/Create', [
            'users' => $users,
            'paymentMethods' => $paymentMethods
        ]);
    }

    public function storeTransaction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'wallet_id' => 'required|exists:wallets,id',
            'type' => 'required|in:deposit,withdrawal,investment,profit,refund',
            'amount' => 'required|numeric|min:0.01',
            'status' => 'required|in:pending,completed,failed',
            'description' => 'required|string|max:500',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'reference_id' => 'nullable|string|max:100',
        ]);

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $validated['user_id'],
            'wallet_id' => $validated['wallet_id'],
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'processing_fee' => 0,
            'net_amount' => $validated['amount'],
            'balance_before' => 0,
            'balance_after' => 0,
            'reference' => $validated['reference_id'] ?? null,
            'status' => $validated['status'],
            'description' => $validated['description'],
            'payment_method_id' => $validated['payment_method_id'],
            'approved_by' => auth()->id(),
        ]);

        // Update wallet balance if transaction is completed
        if ($validated['status'] === 'completed') {
            $wallet = \App\Models\Wallet::findOrFail($validated['wallet_id']);
            
            if ($validated['type'] === 'deposit' || $validated['type'] === 'profit') {
                $wallet->balance += $validated['amount'];
                $wallet->total_deposits += $validated['amount'];
            } elseif ($validated['type'] === 'withdrawal') {
                $wallet->balance -= $validated['amount'];
                $wallet->total_withdrawals += $validated['amount'];
            } elseif ($validated['type'] === 'investment') {
                $wallet->balance -= $validated['amount'];
                $wallet->total_investments += $validated['amount'];
            }
            
            $wallet->save();
        }

        return redirect()->route('admin.transactions')
            ->with('success', 'Transaction created successfully!');
    }

    public function showTransaction($id): InertiaResponse
    {
        $transaction = Transaction::with([
            'user.wallet',
            'wallet',
            'paymentMethod',
            'approvedBy'
        ])->findOrFail($id);

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction
        ]);
    }

    public function editTransaction($id): InertiaResponse
    {
        $transaction = Transaction::with(['user.wallet', 'wallet', 'paymentMethod'])
            ->findOrFail($id);

        $users = \App\Models\User::with('wallet')
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $paymentMethods = \App\Models\PaymentMethod::where('status', 'active')
            ->select('id', 'name', 'type', 'status')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Transactions/Edit', [
            'transaction' => $transaction,
            'users' => $users,
            'paymentMethods' => $paymentMethods
        ]);
    }

    public function updateTransaction(Request $request, $id): RedirectResponse
    {
        $transaction = Transaction::findOrFail($id);
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'wallet_id' => 'required|exists:wallets,id',
            'type' => 'required|in:deposit,withdrawal,investment,profit,refund',
            'amount' => 'required|numeric|min:0.01',
            'status' => 'required|in:pending,completed,failed',
            'description' => 'required|string|max:500',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'reference_id' => 'nullable|string|max:100',
        ]);

        // Update transaction
        $transaction->update($validated);

        // Handle wallet balance updates
        if ($validated['status'] === 'completed') {
            $wallet = \App\Models\Wallet::findOrFail($validated['wallet_id']);
            
            // Recalculate wallet balance based on all completed transactions
            $deposits = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('amount');
                
            $profits = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'profit')
                ->where('status', 'completed')
                ->sum('amount');
                
            $withdrawals = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'withdrawal')
                ->where('status', 'completed')
                ->sum('amount');
                
            $investments = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'investment')
                ->where('status', 'completed')
                ->sum('amount');

            $wallet->balance = ($deposits + $profits) - ($withdrawals + $investments);
            $wallet->total_deposits = $deposits + $profits;
            $wallet->total_withdrawals = $withdrawals;
            $wallet->total_investments = $investments;
            
            $wallet->save();
        }

        return redirect()->route('admin.transactions.show', $transaction->id)
            ->with('success', 'Transaction updated successfully!');
    }

    public function destroyTransaction($id): RedirectResponse
    {
        $transaction = Transaction::findOrFail($id);
        
        // Recalculate wallet balance after deletion
        if ($transaction->status === 'completed') {
            $wallet = \App\Models\Wallet::findOrFail($transaction->wallet_id);
            
            // Recalculate based on remaining transactions
            $deposits = Transaction::where('wallet_id', $wallet->id)
                ->where('id', '!=', $transaction->id)
                ->where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('amount');
                
            $profits = Transaction::where('wallet_id', $wallet->id)
                ->where('id', '!=', $transaction->id)
                ->where('type', 'profit')
                ->where('status', 'completed')
                ->sum('amount');
                
            $withdrawals = Transaction::where('wallet_id', $wallet->id)
                ->where('id', '!=', $transaction->id)
                ->where('type', 'withdrawal')
                ->where('status', 'completed')
                ->sum('amount');
                
            $investments = Transaction::where('wallet_id', $wallet->id)
                ->where('id', '!=', $transaction->id)
                ->where('type', 'investment')
                ->where('status', 'completed')
                ->sum('amount');

            $wallet->balance = ($deposits + $profits) - ($withdrawals + $investments);
            $wallet->total_deposits = $deposits + $profits;
            $wallet->total_withdrawals = $withdrawals;
            $wallet->total_investments = $investments;
            
            $wallet->save();
        }
        
        // Delete the transaction
        $transaction->delete();

        return redirect()->route('admin.transactions')
            ->with('success', 'Transaction deleted successfully!');
    }

    public function createProperty(): InertiaResponse
    {
        $users = \App\Models\User::select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Properties/Create', [
            'users' => $users
        ]);
    }

    public function storeProperty(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'type' => 'required|in:land,resort,hotel,farmhouse',
            'total_area' => 'required|numeric|min:0',
            'total_plots' => 'required|integer|min:1',
            'price_per_plot' => 'required|numeric|min:0',
            'purchase_cost' => 'nullable|numeric|min:0',
            'development_cost' => 'nullable|numeric|min:0',
            'legal_cost' => 'nullable|numeric|min:0',
            'marketing_cost' => 'nullable|numeric|min:0',
            'infrastructure_cost' => 'nullable|numeric|min:0',
            'expected_roi' => 'nullable|numeric|min:0',
            'projected_completion_date' => 'nullable|date',
            'status' => 'required|in:planning,legal_approval,development,completed,sold',
            'tsp_approved' => 'nullable|boolean',
            'government_approved' => 'nullable|boolean',
            'description' => 'nullable|string|max:1000',
        ]);

        // Create property
        $property = \App\Models\Property::create([
            'name' => $validated['name'],
            'location' => $validated['location'],
            'address' => $validated['address'] ?? '',
            'type' => $validated['type'],
            'total_area' => $validated['total_area'],
            'total_plots' => $validated['total_plots'],
            'available_plots' => $validated['total_plots'],
            'sold_plots' => 0,
            'min_plot_price' => $validated['price_per_plot'],
            'max_plot_price' => $validated['price_per_plot'],
            'purchase_cost' => $validated['purchase_cost'] ?? 0,
            'development_cost' => $validated['development_cost'] ?? 0,
            'total_cost' => ($validated['purchase_cost'] ?? 0) + ($validated['development_cost'] ?? 0) + ($validated['legal_cost'] ?? 0) + ($validated['marketing_cost'] ?? 0) + ($validated['infrastructure_cost'] ?? 0),
            'status' => $validated['status'],
            'tsp_approved' => $validated['tsp_approved'] ?? false,
            'government_approved' => $validated['government_approved'] ?? false,
            'description' => $validated['description'] ?? '',
        ]);

        return redirect()->route('admin.properties')
            ->with('success', 'Property created successfully!');
    }

    public function showProperty($id): InertiaResponse
    {
        $property = \App\Models\Property::with([
            'plots',
            'investments',
            'sales'
        ])->findOrFail($id);

        return Inertia::render('Admin/Properties/Show', [
            'property' => $property
        ]);
    }

    public function editProperty($id): InertiaResponse
    {
        $property = \App\Models\Property::findOrFail($id);

        $users = \App\Models\User::select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Properties/Edit', [
            'property' => $property,
            'users' => $users
        ]);
    }

    public function updateProperty(Request $request, $id): RedirectResponse
    {
        $property = \App\Models\Property::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'type' => 'required|in:land,resort,hotel,farmhouse',
            'total_area' => 'required|numeric|min:0',
            'total_plots' => 'required|integer|min:1',
            'price_per_plot' => 'required|numeric|min:0',
            'development_cost' => 'nullable|numeric|min:0',
            'legal_cost' => 'nullable|numeric|min:0',
            'marketing_cost' => 'nullable|numeric|min:0',
            'infrastructure_cost' => 'nullable|numeric|min:0',
            'expected_roi' => 'nullable|numeric|min:0',
            'projected_completion_date' => 'nullable|date',
            'status' => 'required|in:planning,legal_approval,development,completed,sold',
            'tsp_approved' => 'nullable|boolean',
            'government_approved' => 'nullable|boolean',
            'description' => 'nullable|string|max:1000',
        ]);

        // Update property
        $property->update([
            'name' => $validated['name'],
            'location' => $validated['location'],
            'address' => $validated['address'] ?? '',
            'type' => $validated['type'],
            'total_area' => $validated['total_area'],
            'total_plots' => $validated['total_plots'],
            'available_plots' => $validated['total_plots'],
            'sold_plots' => 0,
            'min_plot_price' => $validated['price_per_plot'],
            'max_plot_price' => $validated['price_per_plot'],
            'development_cost' => $validated['development_cost'] ?? 0,
            'total_cost' => ($validated['development_cost'] ?? 0) + ($validated['legal_cost'] ?? 0) + ($validated['marketing_cost'] ?? 0) + ($validated['infrastructure_cost'] ?? 0),
            'expected_roi' => $validated['expected_roi'] ?? 0,
            'projected_completion_date' => $validated['projected_completion_date'] ?? null,
            'status' => $validated['status'],
            'tsp_approved' => $validated['tsp_approved'] ?? false,
            'government_approved' => $validated['government_approved'] ?? false,
            'description' => $validated['description'] ?? '',
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('admin.properties.show', $property->id)
            ->with('success', 'Property updated successfully!');
    }

    public function destroyProperty($id): RedirectResponse
    {
        $property = \App\Models\Property::findOrFail($id);
        
        // Check if property has sold plots
        if ($property->sold_plots > 0) {
            return redirect()->route('admin.properties')
                ->with('error', 'Cannot delete property with sold plots. Please handle existing sales first.');
        }
        
        // Delete the property
        $property->delete();

        return redirect()->route('admin.properties')
            ->with('success', 'Property deleted successfully!');
    }

    public function sales(): InertiaResponse
    {
        $sales = Sale::with(['plot.property', 'initiator'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Sales', [
            'sales' => $sales->items(),
            'pagination' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
                'from' => $sales->firstItem(),
                'to' => $sales->lastItem(),
            ]
        ]);
    }

    public function profits(): InertiaResponse
    {
        $profits = Profit::with(['user', 'sale.plot.property', 'investment'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Profits', [
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

    public function createProfit(): InertiaResponse
    {
        $users = User::orderBy('name')->get(['id', 'name', 'email']);
        $investments = Investment::with(['user', 'property'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();
        $sales = Sale::with(['plot', 'user'])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Profits/Create', [
            'users' => $users,
            'investments' => $investments,
            'sales' => $sales,
        ]);
    }

    public function storeProfit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'investment_id' => 'nullable|exists:investments,id',
            'sale_id' => 'nullable|exists:sales,id',
            'total_profit' => 'required|numeric|min:0',
            'company_percentage' => 'required|numeric|min:0|max:100',
            'profit_percentage' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:pending,distributed,cancelled',
            'calculation_date' => 'required|date',
            'distribution_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validated['company_share'] = $validated['total_profit'] * ($validated['company_percentage'] / 100);
        $validated['investor_share'] = $validated['total_profit'] - $validated['company_share'];
        $validated['calculated_by'] = Auth::id();

        $profit = Profit::create($validated);

        return redirect()->route('profits.show', $profit->id)
            ->with('success', 'Profit record created successfully.');
    }

    public function showProfit(int $id): InertiaResponse
    {
        $profit = Profit::with(['user', 'investment.property', 'sale.plot.property'])
            ->findOrFail($id);

        return Inertia::render('Admin/Profits/Show', [
            'profit' => $profit,
        ]);
    }

    public function editProfit(int $id): InertiaResponse
    {
        $profit = Profit::findOrFail($id);
        $users = User::orderBy('name')->get(['id', 'name', 'email']);
        $investments = Investment::with(['user', 'property'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();
        $sales = Sale::with(['plot', 'user'])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Profits/Edit', [
            'profit' => $profit,
            'users' => $users,
            'investments' => $investments,
            'sales' => $sales,
        ]);
    }

    public function updateProfit(Request $request, int $id): RedirectResponse
    {
        $profit = Profit::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'investment_id' => 'nullable|exists:investments,id',
            'sale_id' => 'nullable|exists:sales,id',
            'total_profit' => 'required|numeric|min:0',
            'company_percentage' => 'required|numeric|min:0|max:100',
            'profit_percentage' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:pending,distributed,cancelled',
            'calculation_date' => 'required|date',
            'distribution_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validated['company_share'] = $validated['total_profit'] * ($validated['company_percentage'] / 100);
        $validated['investor_share'] = $validated['total_profit'] - $validated['company_share'];

        $profit->update($validated);

        return redirect()->route('profits.show', $profit->id)
            ->with('success', 'Profit record updated successfully.');
    }

    public function destroyProfit(int $id): RedirectResponse
    {
        $profit = Profit::findOrFail($id);
        
        if ($profit->status === 'distributed') {
            return redirect()->route('profits.index')
                ->with('error', 'Cannot delete distributed profit records.');
        }

        $profit->delete();

        return redirect()->route('profits.index')
            ->with('success', 'Profit record deleted successfully.');
    }

    public function distributeProfit(int $id): RedirectResponse
    {
        $profit = Profit::findOrFail($id);

        if ($profit->status === 'distributed') {
            return redirect()->route('profits.show', $profit->id)
                ->with('error', 'Profit already distributed.');
        }

        // Add to user's wallet
        $wallet = Wallet::where('user_id', $profit->user_id)->first();
        if ($wallet) {
            $wallet->addBalance((float) $profit->investor_share, 'profit');
        }

        $profit->update([
            'status' => 'distributed',
            'distribution_date' => now(),
        ]);

        return redirect()->route('profits.show', $profit->id)
            ->with('success', 'Profit distributed successfully.');
    }

    public function distributeProfitsBulk(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'profit_ids' => 'required|array',
            'profit_ids.*' => 'exists:profits,id',
        ]);

        $distributedCount = 0;
        $failedCount = 0;

        foreach ($validated['profit_ids'] as $profitId) {
            $profit = Profit::find($profitId);
            
            if ($profit && $profit->status !== 'distributed') {
                $wallet = Wallet::where('user_id', $profit->user_id)->first();
                if ($wallet) {
                    $wallet->addBalance((float) $profit->investor_share, 'profit');
                    $profit->update([
                        'status' => 'distributed',
                        'distribution_date' => now(),
                    ]);
                    $distributedCount++;
                } else {
                    $failedCount++;
                }
            } else {
                $failedCount++;
            }
        }

        return redirect()->route('profits.index')
            ->with('success', "Successfully distributed {$distributedCount} profits. Failed: {$failedCount}");
    }

    public function security(): InertiaResponse
    {
        // Get security settings and logs
        $securityLogs = $this->getSecurityAuditLogs();
        $securitySettings = $this->getSecuritySettings();
        $failedLogins = $this->getFailedLogins();
        $activeSessions = $this->getActiveSessions();

        return Inertia::render('Admin/Security', [
            'securityLogs' => $securityLogs,
            'securitySettings' => $securitySettings,
            'failedLogins' => $failedLogins,
            'activeSessions' => $activeSessions,
        ]);
    }

    private function getFailedLogins(): array
    {
        // Get recent failed login attempts
        return [
            'count_24h' => 0, // Placeholder
            'count_7d' => 0,  // Placeholder
            'recent_attempts' => [], // Placeholder
        ];
    }

    private function getActiveSessions(): array
    {
        // Get active user sessions
        return [
            'total' => 0, // Placeholder
            'users' => [], // Placeholder
        ];
    }

    private function getSecuritySettings(): array
    {
        // Get security configuration
        return [
            'password_policy' => [
                'min_length' => 8,
                'require_uppercase' => true,
                'require_lowercase' => true,
                'require_numbers' => true,
                'require_symbols' => false,
            ],
            'session_timeout' => 120, // minutes
            'max_login_attempts' => 5,
            'lockout_duration' => 15, // minutes
        ];
    }

    private function getSecurityAuditLogs(): array
    {
        // Get security-related audit logs
        // For now, return empty array as placeholder
        // In a real implementation, this would query a security_logs table
        return [];
    }

    public function wallets(): InertiaResponse
    {
        $wallets = Wallet::with(['user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Wallets', [
            'wallets' => $wallets->items(),
            'pagination' => [
                'current_page' => $wallets->currentPage(),
                'last_page' => $wallets->lastPage(),
                'per_page' => $wallets->perPage(),
                'total' => $wallets->total(),
                'from' => $wallets->firstItem(),
                'to' => $wallets->lastItem(),
            ]
        ]);
    }

    public function properties(): InertiaResponse
    {
        $properties = Property::with(['plots', 'sales'])
            ->withCount(['plots', 'sales'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Properties', [
            'properties' => $properties->items(),
            'pagination' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
                'from' => $properties->firstItem(),
                'to' => $properties->lastItem(),
            ]
        ]);
    }

    public function plots(): InertiaResponse
    {
        $plots = Plot::with(['property', 'sale', 'investments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Plots', [
            'plots' => $plots->items(),
            'pagination' => [
                'current_page' => $plots->currentPage(),
                'last_page' => $plots->lastPage(),
                'per_page' => $plots->perPage(),
                'total' => $plots->total(),
                'from' => $plots->firstItem(),
                'to' => $plots->lastItem(),
            ]
        ]);
    }

    public function reports(): InertiaResponse
    {
        // Get comprehensive report data
        $reports = [
            'userReports' => $this->getUserReports(),
            'teamReports' => $this->getTeamReports(),
            'investmentReports' => $this->getInvestmentReports(),
            'salesReports' => $this->getSalesReports(),
            'profitReports' => $this->getProfitReports(),
        ];

        return Inertia::render('Admin/Reports', [
            'reports' => $reports
        ]);
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,team_leader,investor',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['email_verified_at'] = now();
        $validated['status'] = 'active';

        $user = User::create($validated);

        // Create wallet for the user
        Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'total_deposits' => 0,
            'total_withdrawals' => 0,
        ]);

        return redirect()->back()->with('success', 'User created successfully!');
    }

    public function updateUser(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,team_leader,investor',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully!');
    }

    public function destroyUser($id): RedirectResponse
    {
        $user = User::findOrFail($id);
        
        // Delete related records first to avoid foreign key constraint violations
        // Delete user's wallet
        if ($user->wallet) {
            $user->wallet->delete();
        }
        
        // Delete user's investments
        $user->investments()->delete();
        
        // Delete user's transactions
        $user->transactions()->delete();
        
        // Delete user's team memberships
        $user->teamMemberships()->delete();
        
        // If user is a team leader, handle team leadership
        if ($user->ledTeam) {
            $user->ledTeam->delete();
        }
        
        // Finally delete the user
        $user->delete();
        
        return redirect()->back()->with('success', 'User deleted successfully!');
    }

    public function showUser($id): InertiaResponse
    {
        $user = User::with(['wallet', 'ledTeam', 'teamMemberships.team'])
            ->findOrFail($id);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user
        ]);
    }

    public function editUser($id): InertiaResponse
    {
        $user = User::with(['wallet', 'ledTeam', 'teamMemberships.team'])
            ->findOrFail($id);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    public function toggleUserStatus(User $user): RedirectResponse
    {
        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();
        return redirect()->back()->with('success', 'User status updated successfully!');
    }

    public function verifyUser(User $user): RedirectResponse
    {
        $user->kyc_verified = true;
        $user->save();
        return redirect()->back()->with('success', 'User verified successfully!');
    }

    public function storeTeam(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'team_name' => 'required|string|max:255|unique:teams',
            'description' => 'nullable|string|max:1000',
            'team_leader_id' => 'required|exists:users,id',
            'status' => 'required|in:active,pending,inactive',
        ]);

        // Map form field names to database column names
        $teamData = [
            'team_name' => $validated['team_name'],
            'team_leader_id' => $validated['team_leader_id'],
            'status' => $validated['status'],
            'notes' => $validated['description'] ?? null, // Map description to notes column
        ];

        $team = Team::create($teamData);

        return redirect()->back()->with('success', 'Team created successfully!');
    }

    public function destroyTeam($id): RedirectResponse
    {
        $team = Team::findOrFail($id);
        
        // Remove team leader reference
        if ($team->teamLeader) {
            $team->teamLeader->update(['team_id' => null]);
        }
        
        // Remove all team members
        $team->teamMembers()->delete();
        
        // Delete the team
        $team->delete();
        
        return redirect()->back()->with('success', 'Team deleted successfully!');
    }

    public function createTeam(): InertiaResponse
    {
        // Get available users for team leader selection
        $availableUsers = User::select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Teams/Create', [
            'availableUsers' => $availableUsers
        ]);
    }

    public function updateTeam(Request $request, $id): RedirectResponse
    {
        $team = Team::findOrFail($id);
        
        $validated = $request->validate([
            'team_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'team_leader_id' => 'required|exists:users,id',
            'status' => 'required|in:active,pending,inactive',
        ]);

        // Map form field names to database column names
        $teamData = [
            'team_name' => $validated['team_name'],
            'team_leader_id' => $validated['team_leader_id'],
            'status' => $validated['status'],
            'notes' => $validated['description'] ?? null, // Map description to notes column
        ];

        $team->update($teamData);

        return redirect()->back()->with('success', 'Team updated successfully!');
    }

    public function addTeamMember(Request $request, $id): RedirectResponse
    {
        $team = Team::findOrFail($id);
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:member,assistant_leader',
        ]);

        // Check if user is already in a team
        $user = User::findOrFail($validated['user_id']);
        if ($user->team_id) {
            return redirect()->back()->with('error', 'User is already in a team');
        }

        // Map form role to database role
        $roleMapping = [
            'member' => 'investor',
            'assistant_leader' => 'team_leader',
        ];

        $dbRole = $roleMapping[$validated['role']] ?? 'investor';

        // Add user to team
        $user->update([
            'team_id' => $team->id,
            'role' => $dbRole,
        ]);

        // Update team member count
        $team->increment('member_count');

        return redirect()->back()->with('success', 'Member added successfully!');
    }

    public function addTeamMembers(Request $request, $id): InertiaResponse|RedirectResponse
    {
        $team = Team::with(['teamLeader', 'teamMembers.user'])
            ->withCount(['teamMembers'])
            ->findOrFail($id);

        // Add additional members from users.team_id for this team
        $assignedUsers = \App\Models\User::where('team_id', $team->id)
            ->where('id', '!=', $team->team_leader_id)
            ->get()
            ->map(function ($user) use ($team) {
                return (object) [
                    'id' => 'user_' . $user->id,
                    'user_id' => $user->id,
                    'team_id' => $team->id,
                    'status' => 'assigned',
                    'joined_at' => $user->updated_at,
                    'user' => $user
                ];
            });

        // Combine team_members and assigned users
        $allMembers = $team->teamMembers->concat($assignedUsers);
        
        // Create a custom array representation for Inertia
        $teamArray = $team->toArray();
        $teamArray['teamMembers'] = $allMembers->map(function ($member) {
            return [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'team_id' => $member->team_id,
                'status' => $member->status,
                'joined_at' => $member->joined_at,
                'user' => $member->user->toArray()
            ];
        })->toArray();

        // Get all available users (excluding team leader and current members)
        $availableUsers = \App\Models\User::whereNotIn('id', [$team->team_leader_id])
            ->whereNotIn('id', $allMembers->pluck('user_id')->toArray())
            ->orderBy('name')
            ->get();

        if ($request->isMethod('post')) {
            // Handle POST request - form submission
            $validated = $request->validate([
                'user_id' => 'required|string',
                'role' => 'required|in:member,assistant_leader',
            ]);

            // Convert comma-separated string to array
            $userIds = explode(',', $validated['user_id']);
            $userIds = array_filter($userIds, 'trim');
            
            // Validate each user ID exists
            foreach ($userIds as $userId) {
                if (!User::find($userId)) {
                    return redirect()->back()->with('error', 'Invalid user selected');
                }
            }
            
            $addedCount = 0;
            $skippedCount = 0;
            
            foreach ($userIds as $userId) {
                // Check if user is already in team_members
                $existingMember = \App\Models\TeamMember::where('team_id', $team->id)
                    ->where('user_id', $userId)
                    ->first();
                
                if ($existingMember) {
                    $skippedCount++;
                    continue;
                }
                
                // Add to team_members table
                \App\Models\TeamMember::create([
                    'team_id' => $team->id,
                    'user_id' => $userId,
                    'status' => 'joined',
                    'joined_at' => now(),
                    'investment_amount' => 0,
                ]);
                
                // Update user's team_id
                $user = User::find($userId);
                if ($user && !$user->team_id) {
                    $user->team_id = $team->id;
                    $user->save();
                }
                
                $addedCount++;
            }
            
            // Update team member count
            $team->member_count = $team->teamMembers()->count() + $addedCount;
            $team->save();
            
            $message = "Successfully added {$addedCount} members to the team";
            if ($skippedCount > 0) {
                $message .= " ({$skippedCount} users were already in teams and were skipped)";
            }
            
            return redirect()->back()->with('success', $message);
        }
        
        // Handle GET request - show form
        return Inertia::render('Admin/Teams/AddMembers', [
            'team' => $teamArray,
            'availableUsers' => $availableUsers
        ]);
    }

    public function searchUsers(Request $request): \Illuminate\Http\JsonResponse
{
    $query = $request->get('q', '');
    $users = User::where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->select('id', 'name', 'email', 'role')
                ->orderBy('name')
                ->limit(20)
                ->get();
    
    return response()->json($users);
    }

    private function getMonthlyStatistics(): array
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $months[] = [
                'month' => $month->format('M Y'),
                'users' => User::whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->count(),
                'investments' => Investment::whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->sum('amount'),
                'sales' => Sale::whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->sum('sale_price'),
                'profits' => Profit::whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->sum('investor_share'),
            ];
        }
        return $months;
    }

    private function getUserReports(): array
    {
        return [
            'total_by_role' => User::selectRaw('role, count(*) as count')
                ->groupBy('role')
                ->get()
                ->pluck('count', 'role')
                ->toArray(),
            'total_by_status' => User::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray(),
            'kyc_status' => [
                'verified' => User::where('kyc_verified', true)->count(),
                'pending' => User::where('kyc_verified', false)->count(),
            ],
            'registration_status' => [
                'fee_paid' => User::where('registration_fee_paid', '>=', 500)->count(),
                'fee_pending' => User::where('registration_fee_paid', '<', 500)->count(),
            ],
        ];
    }

    private function getTeamReports(): array
    {
        return [
            'total_by_status' => Team::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray(),
            'average_members' => Team::avg('member_count'),
            'complete_teams' => Team::where('member_count', '>=', 20)->count(),
            'incomplete_teams' => Team::where('member_count', '<', 20)->count(),
        ];
    }

    private function getInvestmentReports(): array
    {
        return [
            'total_by_type' => Investment::selectRaw('investment_type, count(*) as count, sum(amount) as total')
                ->groupBy('investment_type')
                ->get()
                ->toArray(),
            'total_by_status' => Investment::selectRaw('status, count(*) as count, sum(amount) as total')
                ->groupBy('status')
                ->get()
                ->toArray(),
            'average_investment' => Investment::where('status', 'approved')->avg('amount'),
        ];
    }

    private function getSalesReports(): array
    {
        return [
            'total_by_status' => Sale::selectRaw('status, count(*) as count, sum(sale_price) as total')
                ->groupBy('status')
                ->get()
                ->toArray(),
            'average_sale_price' => Sale::avg('sale_price'),
            'total_profit' => Sale::sum('profit_amount'),
        ];
    }

    private function getProfitReports(): array
    {
        return [
            'total_by_status' => Profit::selectRaw('status, count(*) as count, sum(investor_share) as total')
                ->groupBy('status')
                ->get()
                ->toArray(),
            'company_vs_investor' => [
                'company' => Profit::sum('company_share'),
                'investor' => Profit::sum('investor_share'),
            ],
            'average_profit_per_sale' => Profit::avg('investor_share'),
        ];
    }

    public function audit(): InertiaResponse
    {
        // Get audit trail data
        $auditData = [
            'recent_user_activities' => User::with(['wallet', 'teamMemberships'])
                ->orderBy('updated_at', 'desc')
                ->take(20)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'action' => $this->getUserLastAction($user),
                        'timestamp' => $user->updated_at,
                        'ip_address' => $user->last_login_ip ?? 'N/A',
                        'user_agent' => 'N/A', // Would need to implement user agent tracking
                    ];
                }),

            'recent_transactions' => Transaction::with(['user', 'wallet'])
                ->orderBy('created_at', 'desc')
                ->take(50)
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'user' => $transaction->user->name,
                        'type' => $transaction->type,
                        'amount' => $transaction->amount,
                        'status' => $transaction->status,
                        'description' => $transaction->description,
                        'timestamp' => $transaction->created_at,
                        'ip_address' => 'N/A', // Would need to implement IP tracking
                    ];
                }),

            'system_logs' => $this->getSystemLogs(),

            'security_events' => $this->getSecurityEvents(),

            'failed_login_attempts' => $this->getFailedLoginAttempts(),

            'data_changes' => $this->getDataChanges(),
        ];

        return Inertia::render('Admin/Audit', [
            'auditData' => $auditData,
        ]);
    }

    private function getUserLastAction($user): string
    {
        // This is a simplified version - you might want to implement proper activity tracking
        if ($user->updated_at->diffInMinutes($user->created_at) < 5) {
            return 'Account Created';
        }
        
        if ($user->status === 'active') {
            return 'Account Active';
        }
        
        return 'Account Updated';
    }

    private function getSystemLogs(): array
    {
        // This would typically read from a logs table or file
        // For now, returning empty array as placeholder
        return [];
    }

    private function getSecurityEvents(): array
    {
        // This would typically track security-related events
        // For now, returning empty array as placeholder
        return [];
    }

    private function getFailedLoginAttempts(): array
    {
        // This would typically track failed login attempts
        // For now, returning empty array as placeholder
        return [];
    }

    private function getDataChanges(): array
    {
        // This would typically track data modifications
        // For now, returning empty array as placeholder
        return [];
    }

    public function settings(): InertiaResponse
    {
        // Get system settings
        $settings = [
            'system' => [
                'app_name' => config('app.name'),
                'app_env' => config('app.env'),
                'app_debug' => config('app.debug'),
                'app_url' => config('app.url'),
                'timezone' => config('app.timezone'),
            ],
            'database' => [
                'connection' => config('database.default'),
                'host' => config('database.connections.mysql.host'),
                'port' => config('database.connections.mysql.port'),
                'database' => config('database.connections.mysql.database'),
            ],
            'mail' => [
                'driver' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'encryption' => config('mail.mailers.smtp.encryption'),
            ],
            'security' => [
                'session_lifetime' => config('session.lifetime'),
                'password_timeout' => config('auth.password_timeout'),
                'throttle' => [
                    'attempts' => config('throttling.login.attempts'),
                    'decay_minutes' => config('throttling.login.decay_minutes'),
                ],
            ],
            'features' => [
                'registration_enabled' => true, // Could be from config
                'email_verification' => config('auth.email_verification', true),
                'two_factor_auth' => config('auth.two_factor.enabled', false),
                'maintenance_mode' => app()->isDownForMaintenance(),
            ],
            'limits' => [
                'max_file_size' => config('filesystems.max_file_size', 10240), // KB
                'max_team_members' => 20,
                'min_wallet_balance' => 10000, // INR
                'hold_limit_days' => 7,
            ],
        ];

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function createWallet(): InertiaResponse
    {
        // Get users without wallets for selection
        $usersWithoutWallets = \App\Models\User::whereDoesntHave('wallet')
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Wallets/Create', [
            'users' => $usersWithoutWallets
        ]);
    }

    public function storeWallet(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:wallets,user_id',
            'balance' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,frozen',
        ]);

        // Create wallet
        \App\Models\Wallet::create([
            'user_id' => $validated['user_id'],
            'balance' => $validated['balance'],
            'status' => $validated['status'],
            'total_deposits' => $validated['balance'],
            'total_withdrawals' => 0,
            'total_investments' => 0,
        ]);

        return redirect()->route('admin.wallets')
            ->with('success', 'Wallet created successfully!');
    }

    public function showWallet($id): InertiaResponse
    {
        $wallet = \App\Models\Wallet::with(['user', 'transactions.paymentMethod'])
            ->findOrFail($id);

        return Inertia::render('Admin/Wallets/Show', [
            'wallet' => $wallet
        ]);
    }

    public function editWallet($id): InertiaResponse
    {
        $wallet = \App\Models\Wallet::with('user')
            ->findOrFail($id);

        return Inertia::render('Admin/Wallets/Edit', [
            'wallet' => $wallet
        ]);
    }

    public function updateWallet(Request $request, $id): RedirectResponse
    {
        $wallet = \App\Models\Wallet::findOrFail($id);
        
        $validated = $request->validate([
            'balance' => 'required|numeric|min:0',
            'frozen_amount' => 'required|numeric|min:0',
            'pending_amount' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,frozen',
        ]);

        $wallet->update($validated);

        return redirect()->route('admin.wallets.show', $wallet->id)
            ->with('success', 'Wallet updated successfully!');
    }

    public function destroyWallet($id): RedirectResponse
    {
        $wallet = \App\Models\Wallet::findOrFail($id);
        
        // Delete all transactions first
        $wallet->transactions()->delete();
        
        // Delete the wallet
        $wallet->delete();

        return redirect()->route('admin.wallets')
            ->with('success', 'Wallet deleted successfully!');
    }

    // Plot Features CRUD Methods
    public function plotFeatures(): InertiaResponse
    {
        $plots = Plot::with(['property'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/PlotFeatures/Index', [
            'plots' => $plots->items(),
            'pagination' => [
                'current_page' => $plots->currentPage(),
                'last_page' => $plots->lastPage(),
                'per_page' => $plots->perPage(),
                'total' => $plots->total(),
                'from' => $plots->firstItem(),
                'to' => $plots->lastItem(),
            ]
        ]);
    }

    public function createPlotFeature(): InertiaResponse
    {
        $properties = \App\Models\Property::all();
        
        return Inertia::render('Admin/PlotFeatures/Create', [
            'properties' => $properties,
            'plotTypes' => ['residential', 'commercial', 'industrial', 'agricultural'],
            'areaUnits' => ['sqft', 'sqm', 'acre', 'hectare'],
            'facingDirections' => [
                'N' => 'North',
                'NE' => 'North-East',
                'E' => 'East',
                'SE' => 'South-East',
                'S' => 'South',
                'SW' => 'South-West',
                'W' => 'West',
                'NW' => 'North-West',
            ],
            'statuses' => ['available', 'held', 'sold', 'reserved'],
        ]);
    }

    public function storePlotFeature(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'property_id' => 'nullable|exists:properties,id',
            'plot_number' => 'required|string|max:255',
            'area' => 'required|numeric|min:0',
            'area_unit' => 'required|string|in:sqft,sqm,acre,hectare',
            'price' => 'required|numeric|min:0',
            'price_per_sqft' => 'nullable|numeric|min:0',
            'plot_type' => 'required|string|in:residential,commercial,industrial,agricultural',
            'road_facing' => 'boolean',
            'status' => 'required|string|in:available,held,sold,reserved',
            'description' => 'nullable|string|max:2000',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'location_details' => 'nullable|string|max:1000',
            'facing_direction' => 'nullable|string|in:N,NE,E,SE,S,SW,W,NW',
            'road_width' => 'nullable|numeric|min:0',
            'corner_plot' => 'boolean',
            'double_road' => 'boolean',
            'location_coordinates' => 'nullable|string|max:255',
            'nearby_amenities' => 'nullable|array',
            'nearby_amenities.*' => 'string|max:255',
            'soil_type' => 'nullable|string|max:255',
            'topography' => 'nullable|string|max:255',
            'legal_clearance' => 'nullable|string|max:255',
            'development_charges' => 'nullable|numeric|min:0',
            'maintenance_charges' => 'nullable|numeric|min:0',
            'water_connection' => 'boolean',
            'electricity_connection' => 'boolean',
            'sewage_connection' => 'boolean',
            'gas_connection' => 'boolean',
            'internet_connection' => 'boolean',
            'road_access' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'priority_level' => 'nullable|integer|min:1|max:10',
            'featured_plot' => 'boolean',
            'original_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'special_offer' => 'boolean',
            'offer_expiry_date' => 'nullable|date|after:today',
            'negotiable' => 'boolean',
        ]);

        // Set default property_id if not provided
        if (!isset($validated['property_id']) || $validated['property_id'] === null) {
            $validated['property_id'] = 1; // Default to first property
        }

        // Calculate price_per_sqft if not provided
        if (!isset($validated['price_per_sqft']) || $validated['price_per_sqft'] === null) {
            $area = $validated['area'];
            $price = $validated['price'];
            $areaUnit = $validated['area_unit'];
            
            // Convert to sqft for calculation
            $areaInSqft = $area;
            if ($areaUnit === 'sqm') {
                $areaInSqft = $area * 10.764;
            } elseif ($areaUnit === 'acre') {
                $areaInSqft = $area * 43560;
            } elseif ($areaUnit === 'hectare') {
                $areaInSqft = $area * 107639;
            }
            
            $validated['price_per_sqft'] = $areaInSqft > 0 ? round($price / $areaInSqft, 2) : 0;
        }

        Plot::create($validated);

        return redirect()->route('admin.plots.features')
            ->with('success', 'Plot created successfully!');
    }

    public function editPlotFeature($id): InertiaResponse
    {
        $plot = Plot::with(['property'])->findOrFail($id);
        $properties = \App\Models\Property::all();
        
        return Inertia::render('Admin/PlotFeatures/Edit', [
            'plot' => $plot,
            'properties' => $properties,
            'plotTypes' => ['residential', 'commercial', 'industrial', 'agricultural'],
            'areaUnits' => ['sqft', 'sqm', 'acre', 'hectare'],
            'facingDirections' => [
                'N' => 'North',
                'NE' => 'North-East',
                'E' => 'East',
                'SE' => 'South-East',
                'S' => 'South',
                'SW' => 'South-West',
                'W' => 'West',
                'NW' => 'North-West',
            ],
            'statuses' => ['available', 'held', 'sold', 'reserved'],
        ]);
    }

    public function updatePlotFeature(Request $request, $id): RedirectResponse
    {
        $plot = Plot::findOrFail($id);

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'plot_number' => 'required|string|max:255',
            'area' => 'required|numeric|min:0',
            'area_unit' => 'required|string|in:sqft,sqm,acre,hectare',
            'price' => 'required|numeric|min:0',
            'price_per_sqft' => 'nullable|numeric|min:0',
            'plot_type' => 'required|string|in:residential,commercial,industrial,agricultural',
            'road_facing' => 'boolean',
            'status' => 'required|string|in:available,held,sold,reserved',
            'description' => 'nullable|string|max:2000',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'location_details' => 'nullable|string|max:1000',
            'facing_direction' => 'nullable|string|in:N,NE,E,SE,S,SW,W,NW',
            'road_width' => 'nullable|numeric|min:0',
            'corner_plot' => 'boolean',
            'double_road' => 'boolean',
            'location_coordinates' => 'nullable|string|max:255',
            'nearby_amenities' => 'nullable|array',
            'nearby_amenities.*' => 'string|max:255',
            'soil_type' => 'nullable|string|max:255',
            'topography' => 'nullable|string|max:255',
            'legal_clearance' => 'nullable|string|max:255',
            'development_charges' => 'nullable|numeric|min:0',
            'maintenance_charges' => 'nullable|numeric|min:0',
            'water_connection' => 'boolean',
            'electricity_connection' => 'boolean',
            'sewage_connection' => 'boolean',
            'gas_connection' => 'boolean',
            'internet_connection' => 'boolean',
            'road_access' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'priority_level' => 'nullable|integer|min:1|max:10',
            'featured_plot' => 'boolean',
            'original_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'special_offer' => 'boolean',
            'offer_expiry_date' => 'nullable|date|after:today',
            'negotiable' => 'boolean',
        ]);

        $plot->update($validated);

        return redirect()->route('admin.plots.features')
            ->with('success', 'Plot updated successfully!');
    }

    public function destroyPlotFeature($id): RedirectResponse
    {
        $plot = Plot::findOrFail($id);
        
        // Check if plot has any related records
        if ($plot->plotHoldings()->exists() || $plot->investments()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete plot. It has related holdings or investments.');
        }

        $plot->delete();

        return redirect()->route('admin.plots.features')
            ->with('success', 'Plot deleted successfully!');
    }
}
