<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
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
        $validator = Validator::make($request->all(), [
            'team_name' => 'required|string|max:255',
            'team_leader_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $team = Team::create($validator->validated());

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

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $team
            ]);
        }

        return Inertia::render('Teams/Show', [
            'team' => $team
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

        $team->update([
            'status' => 'active',
            'activated_at' => now()
        ]);

        // Activate team leader
        $team->teamLeader->update(['status' => 'active']);

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
}
