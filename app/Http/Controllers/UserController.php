<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\KycDocument;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['wallet', 'ledTeam', 'teamMemberships']);
        
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        $users = $query->paginate(10);
        
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        }
        
        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'status', 'search'])
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20',
            'role' => ['required', Rule::in(['investor', 'team_leader', 'admin'])],
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'pan_number' => 'nullable|string|max:20',
            'aadhar_number' => 'nullable|string|max:20',
            'referred_by' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userData = $validator->validated();
        $userData['password'] = Hash::make($userData['password']);
        $userData['referral_code'] = $this->generateReferralCode();
        
        $user = User::create($userData);
        
        // Create wallet for the user
        Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'status' => 'active'
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => $user->load('wallet')
            ], 201);
        }

        return redirect()->route('users.show', $user->id)
            ->with('success', 'User registered successfully');
    }

    public function show(Request $request, string $id)
    {
        $user = User::with([
            'wallet', 
            'ledTeam', 
            'teamMemberships.team',
            'investments.property',
            'investments.plot',
            'plotHoldings.plot',
            'transactions',
            'profits'
        ])->findOrFail($id);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        }

        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'sometimes|required|string|max:20',
            'role' => ['sometimes', 'required', Rule::in(['investor', 'team_leader', 'admin'])],
            'status' => ['sometimes', 'required', Rule::in(['inactive', 'active'])],
            'kyc_verified' => 'sometimes|boolean',
            'registration_approved' => 'sometimes|boolean',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'pan_number' => 'nullable|string|max:20',
            'aadhar_number' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($validator->validated());

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user
            ]);
        }

        return redirect()->route('users.show', $user->id)
            ->with('success', 'User updated successfully');
    }

    public function destroy(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        // Check if user has investments or transactions
        if ($user->investments()->count() > 0 || $user->transactions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user with existing investments or transactions'
            ], 422);
        }

        $user->delete();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        }

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully');
    }

    public function activateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        // Check if registration fee is paid
        if ($user->registration_fee_paid < 500) {
            return response()->json([
                'success' => false,
                'message' => 'Registration fee must be paid before activation'
            ], 422);
        }

        // Check if user has a complete team (20 members)
        if ($user->ledTeam && $user->ledTeam->member_count < 20) {
            return response()->json([
                'success' => false,
                'message' => 'Team must have at least 20 members before activation'
            ], 422);
        }

        $user->update([
            'status' => 'active',
            'registration_approved' => true
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User activated successfully',
                'data' => $user
            ]);
        }

        return redirect()->route('users.show', $user->id)
            ->with('success', 'User activated successfully');
    }

    public function updateKyc(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'pan_number' => 'required|string|max:20',
            'aadhar_number' => 'required|string|max:20',
            'address' => 'required|string',
            'date_of_birth' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($validator->validated());
        $user->update(['kyc_verified' => true]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'KYC updated and verified successfully',
                'data' => $user
            ]);
        }

        return redirect()->route('users.show', $user->id)
            ->with('success', 'KYC updated and verified successfully');
    }

    public function uploadKycDocument(Request $request, string $userId)
    {
        $user = User::findOrFail($userId);
        
        $validator = Validator::make($request->all(), [
            'document_type' => 'required|in:pan_card,aadhar_card,address_proof,bank_statement,photo_id,other',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB
            'document_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('document');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('kyc_documents', $fileName, 'public');

        $kycDocument = KycDocument::create([
            'user_id' => $userId,
            'document_type' => $request->document_type,
            'document_name' => $request->document_name,
            'file_path' => $filePath,
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'status' => 'pending',
        ]);

        // Check if user has all required documents KYC complete
        if ($user->isKycComplete()) {
            $user->update(['kyc_verified' => true]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'KYC document uploaded successfully',
                'data' => $kycDocument
            ]);
        }

        return redirect()->route('users.show', $userId)
            ->with('success', 'KYC document uploaded successfully');
    }

    public function verifyKycDocument(Request $request, string $documentId)
    {
        $document = KycDocument::findOrFail($documentId);
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $document->update([
            'status' => $request->status,
            'rejection_reason' => $request->rejection_reason,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
            'notes' => $request->notes,
        ]);

        // Update user KYC status if all documents are approved
        $user = $document->user;
        if ($user->isKycComplete()) {
            $user->update(['kyc_verified' => true]);
        } else {
            $user->update(['kyc_verified' => false]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => "KYC document {$request->status} successfully",
                'data' => $document
            ]);
        }

        return redirect()->route('users.show', $user->id)
            ->with('success', "KYC document {$request->status} successfully");
    }

    public function deleteKycDocument(string $documentId)
    {
        $document = KycDocument::findOrFail($documentId);
        
        // Delete file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();

        // Update user KYC status
        $user = $document->user;
        if (!$user->isKycComplete()) {
            $user->update(['kyc_verified' => false]);
        }

        return response()->json([
            'success' => true,
            'message' => 'KYC document deleted successfully'
        ]);
    }

    public function payRegistrationFee(Request $request, string $userId)
    {
        $user = User::findOrFail($userId);
        
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:500',
            'payment_mode' => 'required|in:cash,bank_transfer,upi,cheque,online',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $amount = $request->amount;
        
        // Create transaction record
        $transaction = Transaction::create([
            'user_id' => $userId,
            'wallet_id' => $user->wallet->id,
            'type' => 'deposit',
            'amount' => $amount,
            'balance_before' => $user->wallet->balance,
            'balance_after' => $user->wallet->balance + $amount,
            'reference' => 'REG_FEE_' . strtoupper(uniqid()),
            'description' => 'Registration fee payment',
            'status' => 'completed',
            'payment_mode' => $request->payment_mode,
            'payment_reference' => $request->payment_reference,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Update user registration fee
        $user->increment('registration_fee_paid', $amount);
        
        // Update wallet balance
        $user->wallet->update([
            'balance' => $user->wallet->balance + $amount,
            'total_deposits' => $user->wallet->total_deposits + $amount,
        ]);

        // Check if user can be activated
        if ($user->canBeActivated()) {
            $user->update([
                'status' => 'active',
                'registration_approved' => true
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Registration fee payment recorded successfully',
                'data' => [
                    'transaction' => $transaction,
                    'user' => $user
                ]
            ]);
        }

        return redirect()->route('users.show', $userId)
            ->with('success', 'Registration fee payment recorded successfully');
    }

    private function generateReferralCode(): string
    {
        do {
            $code = 'REF' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (User::where('referral_code', $code)->exists());
        
        return $code;
    }
}
