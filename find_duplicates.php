<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Team;

// Find duplicate team names
$teams = Team::select('team_name')->get();
$teamNames = [];

foreach ($teams as $team) {
    if (isset($teamNames[$team->team_name])) {
        $teamNames[$team->team_name]++;
    } else {
        $teamNames[$team->team_name] = 1;
    }
}

echo "Duplicate team names:\n";
foreach ($teamNames as $name => $count) {
    if ($count > 1) {
        echo "- {$name} (appears {$count} times)\n";
    }
}
