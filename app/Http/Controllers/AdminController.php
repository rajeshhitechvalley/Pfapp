<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Team;
use App\Models\Wallet;
use App\Models\Investment;
use App\Models\Property;
use App\Models\Plot;
use App\Models\Transaction;
use App\Models\Sale;
use App\Models\Profit;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
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

    public function users(): Response
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

    public function teams(): Response
    {
        $teams = Team::with(['teamLeader', 'teamMembers.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

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

    public function investments(): Response
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

    public function transactions(): Response
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

    public function sales(): Response
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

    public function profits(): Response
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

    public function wallets(): Response
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

    public function properties(): Response
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

    public function plots(): Response
    {
        $plots = Plot::with(['property', 'sales', 'investment'])
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

    public function reports(): Response
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
        $team->teamMembers()->update(['team_id' => null]);
        
        // Delete the team
        $team->delete();
        
        return redirect()->back()->with('success', 'Team deleted successfully!');
    }

    public function updateTeam(Request $request, $id): RedirectResponse
    {
        $team = Team::findOrFail($id);
        
        $validated = $request->validate([
            'team_name' => 'required|string|max:255|unique:teams,team_name,' . $team->id,
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

    public function addTeamMembers(Request $request, $id): RedirectResponse
    {
        $team = Team::findOrFail($id);
        
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

        // Map form role to database role
        $roleMapping = [
            'member' => 'investor',
            'assistant_leader' => 'team_leader',
        ];

        $dbRole = $roleMapping[$validated['role']] ?? 'investor';

        $addedCount = 0;
        $skippedCount = 0;

        foreach ($userIds as $userId) {
            $user = User::findOrFail($userId);
            
            // Check if user is already in a team
            if ($user->team_id) {
                $skippedCount++;
                continue;
            }

            // Add user to team
            $user->update([
                'team_id' => $team->id,
                'role' => $dbRole,
            ]);

            $addedCount++;
        }

        // Update team member count
        $team->increment('member_count', $addedCount);

        $message = "Successfully added {$addedCount} members to the team";
        if ($skippedCount > 0) {
            $message .= " ({$skippedCount} users were already in teams and were skipped)";
        }

        return redirect()->back()->with('success', $message);
    }

    public function searchUsers(Request $request)
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
}
