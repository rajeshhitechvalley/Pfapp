<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Referral;
use App\Models\Investment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $query = Team::with(['teamLeader', 'teamMembers.user']);
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $teams = $query->paginate(10);
        
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $teams
            ]);
        }
        
        return Inertia::render('Teams/Index', [
            'teams' => $teams,
            'filters' => $request->only(['status'])
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        // Check if user can create team
        if (!$user->canCreateTeam()) {
            return redirect()->back()
                ->with('error', 'You cannot create a team. You may already have a team or your account is not active.');
        }

        $validator = Validator::make($request->all(), [
            'team_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $team = Team::create([
            'team_name' => $validator->validated()['team_name'],
            'description' => $validator->validated()['description'] ?? null,
            'team_leader_id' => $user->id,
            'member_count' => 1, // Team leader counts as first member
            'status' => 'pending',
        ]);

        // Add team leader as first member
        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'status' => 'joined',
            'joined_at' => now(),
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Team created successfully',
                'data' => $team
            ], 201);
        }

        return redirect()->route('teams.show', $team->id)
            ->with('success', 'Team created successfully');
    }

    public function show(Request $request, string $id)
    {
        $team = Team::with([
            'teamLeader',
            'teamMembers.user',
            'teamMembers.investments'
        ])->findOrFail($id);

        // Calculate team statistics
        $stats = [
            'total_members' => $team->member_count,
            'active_members' => $team->teamMembers()->whereHas('user', function($query) {
                $query->where('status', 'active');
            })->count(),
            'inactive_members' => $team->teamMembers()->whereHas('user', function($query) {
                $query->where('status', 'inactive');
            })->count(),
            'total_investments' => $team->investments()->sum('amount'),
            'average_investment' => $team->investments()->avg('amount') ?? 0,
            'growth_rate' => $this->calculateGrowthRate($team),
            'activation_progress' => ($team->member_count / 20) * 100,
        ];

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'team' => $team,
                    'stats' => $stats
                ]
            ]);
        }

        return Inertia::render('Teams/Show', [
            'team' => $team,
            'stats' => $stats
        ]);
    }

    public function edit(string $id): Response
    {
        $team = Team::with('teamLeader')->findOrFail($id);
        $teamLeaders = User::where('role', 'team_leader')->get();
        
        return Inertia::render('Teams/Edit', [
            'team' => $team,
            'teamLeaders' => $teamLeaders
        ]);
    }

    public function addMember(Request $request, string $teamId)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $team = Team::findOrFail($teamId);
        
        // Check if user is already a member
        if ($team->teamMembers()->where('user_id', $request->user_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'User is already a team member'
            ], 422);
        }

        $teamMember = TeamMember::create([
            'team_id' => $teamId,
            'user_id' => $request->user_id,
            'status' => 'joined',
            'joined_at' => now()
        ]);

        // Update team member count
        $team->increment('member_count');

        // Check if team reaches 20 members and activate
        if ($team->member_count >= 20 && $team->status !== 'active') {
            $this->activateTeamPrivate($team);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Member added successfully',
                'data' => $teamMember
            ]);
        }

        return redirect()->route('teams.show', $teamId)
            ->with('success', 'Member added successfully');
    }

    public function removeMember(Request $request, string $teamId, string $userId)
    {
        $team = Team::findOrFail($teamId);
        $teamMember = TeamMember::where('team_id', $teamId)
            ->where('user_id', $userId)
            ->firstOrFail();

        // Team leaders cannot be removed
        if ($teamMember->user_id === $team->team_leader_id) {
            return response()->json([
                'success' => false,
                'message' => 'Team leaders cannot be removed from their own team'
            ], 422);
        }

        $teamMember->update([
            'status' => 'left',
            'left_at' => now()
        ]);

        $team->decrement('member_count');

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Member removed successfully'
            ]);
        }

        return redirect()->route('teams.show', $teamId)
            ->with('success', 'Member removed successfully');
    }

    public function update(Request $request, string $id)
    {
        $team = Team::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'team_name' => 'sometimes|required|string|max:255',
            'team_leader_id' => 'sometimes|required|exists:users,id',
            'status' => ['sometimes', 'required', Rule::in(['pending', 'active', 'inactive'])],
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $team->update($validator->validated());

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Team updated successfully',
                'data' => $team
            ]);
        }

        return redirect()->route('teams.show', $team->id)
            ->with('success', 'Team updated successfully');
    }

    public function destroy(Request $request, string $id)
    {
        $team = Team::findOrFail($id);
        
        // Check if team has active investments or sales
        if ($team->teamMembers()->where('status', 'joined')->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete team with active members'
            ], 422);
        }

        $team->delete();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Team deleted successfully'
            ]);
        }

        return redirect()->route('teams.index')
            ->with('success', 'Team deleted successfully');
    }

    public function activateTeam(Request $request, string $id)
    {
        $team = Team::findOrFail($id);
        
        if ($team->member_count < 20) {
            return response()->json([
                'success' => false,
                'message' => 'Team must have at least 20 members to activate'
            ], 422);
        }

        $this->activateTeamPrivate($team);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Team activated successfully',
                'data' => $team
            ]);
        }

        return redirect()->route('teams.show', $team->id)
            ->with('success', 'Team activated successfully');
    }

    public function inviteMembers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invite_method' => 'required|in:email,sms,whatsapp',
            'email' => 'required_if:invite_method,email|email',
            'phone' => 'required_if:invite_method,sms,whatsapp|string',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $team = $user->ledTeam;

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'You must have a team to invite members'
            ], 422);
        }

        $validated = $validator->validated();
        
        // Create referral record
        $referral = Referral::create([
            'referrer_id' => $user->id,
            'team_id' => $team->id,
            'referral_code' => $team->team_id,
            'status' => 'pending',
        ]);

        // Send invitation based on method
        try {
            switch ($validated['invite_method']) {
                case 'email':
                    $this->sendEmailInvitation($validated['email'], $team, $user, $validated['message'] ?? '');
                    break;
                case 'sms':
                    $this->sendSMSInvitation($validated['phone'], $team, $user, $validated['message'] ?? '');
                    break;
                case 'whatsapp':
                    $this->sendWhatsAppInvitation($validated['phone'], $team, $user, $validated['message'] ?? '');
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => 'Invitation sent successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send invitation: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send invitation. Please try again.'
            ], 500);
        }
    }

    public function getTeamHierarchy(Request $request, string $id)
    {
        $team = Team::with(['teamLeader', 'teamMembers.user.investments'])->findOrFail($id);
        
        $hierarchy = $this->buildHierarchy($team);
        
        return response()->json([
            'success' => true,
            'data' => $hierarchy
        ]);
    }

    public function getTeamPerformance(Request $request, string $id)
    {
        $team = Team::with(['teamMembers.user.investments'])->findOrFail($id);
        
        $performance = [
            'growth_data' => $team->getGrowthData(),
            'top_performers' => $team->getTopPerformers(),
            'monthly_investments' => $this->getMonthlyInvestments($team),
            'member_activity' => $this->getMemberActivity($team),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $performance
        ]);
    }

    private function activateTeamPrivate(Team $team): void
    {
        $team->update([
            'status' => 'active',
            'activated_at' => now()
        ]);

        // Activate team leader
        $team->teamLeader->update(['status' => 'active']);

        // Activate all team members who have paid registration fee
        $team->teamMembers()->whereHas('user', function($query) {
            $query->where('registration_fee_paid', '>=', 500);
        })->get()->each(function($member) {
            $member->user->update(['status' => 'active']);
        });

        Log::info("Team {$team->id} activated with {$team->member_count} members");
    }

    private function calculateGrowthRate(Team $team): float
    {
        $membersLastMonth = $team->teamMembers()
            ->where('joined_at', '>=', now()->subMonth())
            ->count();
        
        $totalMembers = $team->member_count;
        
        if ($totalMembers === 0) return 0;
        
        return round(($membersLastMonth / $totalMembers) * 100, 2);
    }

    private function sendEmailInvitation(string $email, Team $team, User $referrer, string $message = ''): void
    {
        // Implementation for email invitation
        Log::info("Email invitation sent to {$email} for team {$team->id}");
    }

    private function sendSMSInvitation(string $phone, Team $team, User $referrer, string $message = ''): void
    {
        // Implementation for SMS invitation
        Log::info("SMS invitation sent to {$phone} for team {$team->id}");
    }

    private function sendWhatsAppInvitation(string $phone, Team $team, User $referrer, string $message = ''): void
    {
        // Implementation for WhatsApp invitation
        Log::info("WhatsApp invitation sent to {$phone} for team {$team->id}");
    }

    private function buildHierarchy(Team $team): array
    {
        // Build team hierarchy/tree structure
        return [
            'team' => [
                'id' => $team->id,
                'name' => $team->team_name,
                'leader' => $team->teamLeader,
            ],
            'members' => $team->teamMembers->map(function($member) {
                return [
                    'id' => $member->id,
                    'user' => $member->user,
                    'joined_at' => $member->joined_at,
                    'investment_amount' => $member->investment_amount,
                ];
            })->toArray()
        ];
    }

    private function getMonthlyInvestments(Team $team): array
    {
        return $team->investments()
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    private function getMemberActivity(Team $team): array
    {
        return $team->teamMembers()
            ->selectRaw('DATE(joined_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }
}
