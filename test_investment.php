<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;

echo "Testing Investment Creation\n";

// Check if user exists and create test data if needed
$user = User::first();
if ($user) {
    echo "Found user: " . $user->name . "\n";
    echo "User Status: " . $user->status . "\n";
    echo "KYC Verified: " . ($user->kyc_verified ? 'Yes' : 'No') . "\n";
    
    $wallet = $user->wallet;
    if ($wallet) {
        echo "Wallet Balance: " . $wallet->balance . "\n";
    } else {
        echo "No wallet found\n";
    }
} else {
    echo "No user found\n";
}

// Test eligibility check
if ($user) {
    $errors = [];
    
    if (!$user->isActive()) {
        $errors[] = 'User account must be active';
    }
    
    if (!$user->kyc_verified) {
        $errors[] = 'KYC verification required';
    }
    
    if ($user->registration_fee_paid < 500) {
        $errors[] = 'Registration fee must be paid';
    }
    
    $wallet = $user->wallet;
    if (!$wallet || $wallet->balance < 500) {
        $errors[] = 'Wallet balance must be at least $500';
    }
    
    echo "Eligibility Check:\n";
    if (empty($errors)) {
        echo "ELIGIBLE\n";
    } else {
        echo "NOT ELIGIBLE:\n";
        foreach ($errors as $error) {
            echo "- " . $error . "\n";
        }
    }
}
