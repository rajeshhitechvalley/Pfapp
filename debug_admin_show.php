<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "=== Testing Admin Team Show Method ===\n";
    
    // Simulate the exact showTeam method
    $team = \App\Models\Team::with(['teamLeader', 'teamMembers.user'])
        ->withCount(['teamMembers'])
        ->findOrFail(3);

    echo "Team loaded: " . $team->team_name . " (ID: " . $team->id . ")\n";
    echo "Team Leader: " . ($team->teamLeader ? $team->teamLeader->name : 'None') . "\n";
    echo "Original teamMembers count: " . $team->teamMembers->count() . "\n";

    // Apply the same transformation as in the controller
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

    echo "Assigned users count: " . $assignedUsers->count() . "\n";

    // Combine team_members and assigned users
    $allMembers = $team->teamMembers->concat($assignedUsers);
    $team->setRelation('teamMembers', $allMembers);
    
    echo "Final teamMembers count: " . $team->teamMembers->count() . "\n";
    
    if ($team->teamMembers->count() > 0) {
        echo "\nMembers:\n";
        foreach ($team->teamMembers as $member) {
            echo "  - ID: " . $member->id . "\n";
            echo "    User ID: " . $member->user_id . "\n";
            echo "    Status: " . $member->status . "\n";
            echo "    User Name: " . ($member->user ? $member->user->name : 'No user') . "\n";
            echo "    User Email: " . ($member->user ? $member->user->email : 'No email') . "\n";
            echo "    ---\n";
        }
    }
    
    // Test JSON serialization (like Inertia does)
    echo "\nJSON serialization test:\n";
    $teamArray = $team->toArray();
    echo "teamMembers in array: " . (isset($teamArray['teamMembers']) ? 'Yes' : 'No') . "\n";
    if (isset($teamArray['teamMembers'])) {
        echo "teamMembers count in array: " . count($teamArray['teamMembers']) . "\n";
        echo "First member data: " . json_encode($teamArray['teamMembers'][0], JSON_PRETTY_PRINT) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
