<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\KycDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiter as CacheRateLimiter;

class AuthController extends Controller
{
    /**
     * Enhanced user registration with validation
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|regex:/^[0-9]{10}$/',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'address' => 'required|string|max:1000',
            'pan_number' => 'nullable|string|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
        ]);

        // Create user with inactive status
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'address' => $validated['address'],
            'pan_number' => $validated['pan_number'] ?? null,
            'role' => 'investor',
            'status' => 'inactive',
            'registration_fee_paid' => 0,
            'registration_approved' => false,
            'referral_code' => $this->generateReferralCode(),
        ]);

        // Create wallet for user
        $user->wallet()->create([
            'balance' => 0,
            'total_deposits' => 0,
        ]);

        // Send confirmation email
        try {
            Mail::to($user->email)->send(new \App\Mail\RegistrationConfirmation($user));
        } catch (\Exception $e) {
            Log::error('Failed to send registration email: ' . $e->getMessage());
        }

        return redirect()->route('login')->with('success', 'Registration successful! Please pay the registration fee to activate your account.');
    }

    /**
     * Enhanced login with account lockout
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        // Check rate limiting
        $key = 'login:' . strtolower($validated['login']);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw Lockout::withResponse(
                response()->json(['message' => 'Too many login attempts. Please try again later.'], 429)
            );
        }

        // Find user by email or phone
        $user = User::where('email', $validated['login'])
            ->orWhere('phone', $validated['login'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($key, 300); // Lock for 5 minutes
            return back()->withErrors([
                'login' => 'The provided credentials are incorrect.',
            ]);
        }

        // Clear rate limiter on successful login
        RateLimiter::clear($key);

        // Check if user is active
        if ($user->status !== 'active') {
            return back()->withErrors([
                'login' => 'Your account is not active. Please complete registration fee payment.',
            ]);
        }

        // Authenticate user
        auth()->login($user, $request->boolean('remember'));

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Send OTP for password reset
     */
    public function sendPasswordResetOTP(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $validated['email'])->first();
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache (valid for 10 minutes)
        CacheRateLimiter::put('password_reset_otp:' . $user->id, $otp, 600);

        try {
            Mail::to($user->email)->send(new \App\Mail\PasswordResetOTP($otp));
        } catch (\Exception $e) {
            Log::error('Failed to send password reset OTP: ' . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send OTP. Please try again.']);
        }

        return back()->with('success', 'OTP sent to your email address.');
    }

    /**
     * Verify OTP for password reset
     */
    public function verifyPasswordResetOTP(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $validated['email'])->first();
        $storedOtp = CacheRateLimiter::get('password_reset_otp:' . $user->id);

        if (!$storedOtp || $storedOtp !== $validated['otp']) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP.']);
        }

        // Clear OTP after verification
        CacheRateLimiter::forget('password_reset_otp:' . $user->id);

        // Store verification in session
        session(['password_reset_verified' => $user->id]);

        return redirect()->route('password.reset.form');
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        if (!session('password_reset_verified')) {
            return redirect()->route('password.request');
        }

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = User::find(session('password_reset_verified'));
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Clear session
        session()->forget('password_reset_verified');

        return redirect()->route('login')->with('success', 'Password reset successfully.');
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'required|string|regex:/^[0-9]{10}$/|unique:users,phone,' . $user->id,
            'address' => 'required|string|max:1000',
            'date_of_birth' => 'nullable|date|before:today',
            'pan_number' => 'nullable|string|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
            'aadhar_number' => 'nullable|string|regex:/^[0-9]{12}$/',
            'occupation' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:255',
            'bank_ifsc' => 'nullable|string|regex:/^[A-Z]{4}[0-9]{7}$/',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoPath = $photo->store('photos', 'public');
            $validated['photo'] = $photoPath;
        }

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Upload KYC document
     */
    public function uploadKycDocument(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'document_type' => 'required|in:aadhar,pan,driving_license,passport',
            'document_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        // Check if document type already exists
        $existingDoc = KycDocument::where('user_id', $user->id)
            ->where('document_type', $validated['document_type'])
            ->whereNotIn('status', ['rejected'])
            ->first();

        if ($existingDoc) {
            return back()->withErrors(['document_type' => 'This document type is already submitted.']);
        }

        // Handle file upload
        $file = $request->file('document_file');
        $filePath = $file->store('kyc_documents', 'public');

        KycDocument::create([
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'document_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'status' => 'pending',
        ]);

        return back()->with('success', 'KYC document uploaded successfully.');
    }

    /**
     * Change password with current password verification
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = auth()->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password changed successfully.');
    }

    /**
     * Secure logout with session termination
     */
    public function logout(Request $request)
    {
        // Clear all sessions for this user
        auth()->logout();
        
        // Invalidate current session
        $request->session()->invalidate();
        
        // Regenerate CSRF token
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'You have been logged out successfully.');
    }

    /**
     * Generate unique referral code
     */
    private function generateReferralCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}
