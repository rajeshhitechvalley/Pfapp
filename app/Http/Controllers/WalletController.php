<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $wallet = $user->wallet;
        
        if (!$wallet) {
            return redirect()->route('dashboard')
                ->with('error', 'Wallet not found');
        }

        $query = $wallet->transactions()->with(['user', 'paymentMethod']);
        
        // Filter by transaction type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        $transactions = $query->orderBy('created_at', 'desc')->paginate(20);
        $summary = $wallet->getTransactionSummary();
        $paymentMethods = PaymentMethod::active()->get();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'wallet' => $wallet,
                    'transactions' => $transactions,
                    'summary' => $summary,
                    'payment_methods' => $paymentMethods
                ]
            ]);
        }

        return Inertia::render('Wallet/Index', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'summary' => $summary,
            'paymentMethods' => $paymentMethods,
            'filters' => $request->only(['type', 'status', 'start_date', 'end_date'])
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = auth()->user();
        $wallet = $user->wallet;
        
        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found'
            ], 404);
        }

        $transaction = $wallet->transactions()
            ->with(['user', 'paymentMethod'])
            ->findOrFail($id);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $transaction
            ]);
        }

        return Inertia::render('Wallet/Show', [
            'transaction' => $transaction
        ]);
    }

    public function deposit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:500',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'payment_mode' => 'required|in:cash,bank_transfer,upi,cheque,online',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'auto_approve' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $wallet = $user->wallet;
        $paymentMethod = PaymentMethod::findOrFail($request->payment_method_id);

        // Validate payment method limits
        if (!$paymentMethod->canProcessAmount($request->amount)) {
            return response()->json([
                'success' => false,
                'message' => 'Amount is outside the allowed range for this payment method'
            ], 422);
        }

        $processingFee = $paymentMethod->calculateProcessingFee($request->amount);
        $netAmount = $paymentMethod->getNetAmount($request->amount);

        try {
            DB::beginTransaction();

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'payment_method_id' => $paymentMethod->id,
                'type' => 'deposit',
                'amount' => $request->amount,
                'processing_fee' => $processingFee,
                'net_amount' => $netAmount,
                'balance_before' => $wallet->balance,
                'balance_after' => $wallet->balance + $netAmount,
                'reference' => 'DEP_' . strtoupper(uniqid()),
                'description' => $request->notes ?: 'Deposit via ' . $paymentMethod->name,
                'payment_mode' => $request->payment_mode,
                'payment_reference' => $request->payment_reference,
                'status' => $request->auto_approve ? 'completed' : 'pending',
                'approved_by' => $request->auto_approve ? auth()->id() : null,
                'approved_at' => $request->auto_approve ? now() : null,
            ]);

            // If auto-approved, update wallet balance
            if ($request->auto_approve) {
                $wallet->addBalance($netAmount);
            } else {
                // Add to pending amount
                $wallet->addPendingAmount($netAmount);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Deposit request submitted successfully',
                'data' => [
                    'transaction' => $transaction,
                    'wallet' => $wallet->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process deposit: ' . $e->getMessage()
            ], 500);
        }
    }

    public function withdraw(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:500',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'payment_mode' => 'required|in:cash,bank_transfer,upi,cheque,online',
            'bank_account' => 'required_if:payment_mode,bank_transfer,cheque|string|max:255',
            'upi_id' => 'required_if:payment_mode,upi|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $wallet = $user->wallet;
        $paymentMethod = PaymentMethod::findOrFail($request->payment_method_id);

        // Check if user can withdraw this amount
        if (!$wallet->canWithdraw($request->amount)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance'
            ], 422);
        }

        // Validate payment method limits
        if (!$paymentMethod->canProcessAmount($request->amount)) {
            return response()->json([
                'success' => false,
                'message' => 'Amount is outside the allowed range for this payment method'
            ], 422);
        }

        $processingFee = $paymentMethod->calculateProcessingFee($request->amount);
        $netAmount = $paymentMethod->getNetAmount($request->amount);

        try {
            DB::beginTransaction();

            // Freeze the amount
            $wallet->freezeAmount($request->amount);

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'payment_method_id' => $paymentMethod->id,
                'type' => 'withdrawal',
                'amount' => $request->amount,
                'processing_fee' => $processingFee,
                'net_amount' => $netAmount,
                'balance_before' => $wallet->balance,
                'balance_after' => $wallet->balance - $request->amount,
                'reference' => 'WTH_' . strtoupper(uniqid()),
                'description' => $request->notes ?: 'Withdrawal via ' . $paymentMethod->name,
                'payment_mode' => $request->payment_mode,
                'bank_account' => $request->bank_account,
                'upi_id' => $request->upi_id,
                'status' => 'pending',
                'metadata' => json_encode([
                    'bank_account' => $request->bank_account,
                    'upi_id' => $request->upi_id,
                ])
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal request submitted successfully',
                'data' => [
                    'transaction' => $transaction,
                    'wallet' => $wallet->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process withdrawal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approveTransaction(Request $request, string $transactionId)
    {
        $transaction = Transaction::findOrFail($transactionId);
        
        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not pending'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $wallet = $transaction->wallet;

            if ($transaction->type === 'deposit') {
                // Remove from pending and add to balance
                $wallet->removePendingAmount($transaction->net_amount);
                $wallet->addBalance($transaction->net_amount);
            } elseif ($transaction->type === 'withdrawal') {
                // Unfreeze and deduct from balance
                $wallet->unfreezeAmount($transaction->amount);
                $wallet->deductBalance($transaction->amount);
            }

            $transaction->update([
                'status' => 'completed',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction approved successfully',
                'data' => [
                    'transaction' => $transaction->fresh(),
                    'wallet' => $wallet->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    public function rejectTransaction(Request $request, string $transactionId)
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction = Transaction::findOrFail($transactionId);
        
        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not pending'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $wallet = $transaction->wallet;

            if ($transaction->type === 'deposit') {
                // Remove from pending amount
                $wallet->removePendingAmount($transaction->net_amount);
            } elseif ($transaction->type === 'withdrawal') {
                // Unfreeze the amount
                $wallet->unfreezeAmount($transaction->amount);
            }

            $transaction->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction rejected successfully',
                'data' => [
                    'transaction' => $transaction->fresh(),
                    'wallet' => $wallet->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    public function payRegistrationFee(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_method_id' => 'required|exists:payment_methods,id',
            'payment_mode' => 'required|in:upi,card,net_banking,wallet',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        
        // Check if registration fee is already paid
        if ($user->registration_fee_paid >= 500) {
            return response()->json([
                'success' => false,
                'message' => 'Registration fee already paid'
            ], 422);
        }

        $paymentMethod = PaymentMethod::findOrFail($request->payment_method_id);
        $amount = 500;

        try {
            DB::beginTransaction();

            // Create registration fee transaction
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $user->wallet->id,
                'payment_method_id' => $paymentMethod->id,
                'type' => 'registration_fee',
                'amount' => $amount,
                'processing_fee' => 0,
                'net_amount' => $amount,
                'balance_before' => $user->wallet->balance,
                'balance_after' => $user->wallet->balance,
                'reference' => 'REG_' . strtoupper(uniqid()),
                'description' => 'Registration fee payment',
                'payment_mode' => $request->payment_mode,
                'payment_reference' => $request->payment_reference,
                'status' => 'pending',
            ]);

            // Update user registration fee status
            $user->update([
                'registration_fee_paid' => $amount,
                'registration_approved' => false, // Will be approved after payment confirmation
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration fee payment initiated successfully',
                'data' => [
                    'transaction' => $transaction,
                    'user' => $user->fresh()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process registration fee: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTransactionHistory(Request $request)
    {
        $user = auth()->user();
        $wallet = $user->wallet;
        
        $query = $wallet->transactions()->with(['paymentMethod']);
        
        // Apply filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    public function getWalletSummary()
    {
        $user = auth()->user();
        $wallet = $user->wallet;
        
        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found'
            ], 404);
        }

        $summary = $wallet->getTransactionSummary();
        
        // Add recent transactions
        $recentTransactions = $wallet->transactions()
            ->with(['paymentMethod'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Add monthly statistics
        $monthlyStats = $wallet->transactions()
            ->selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) as deposits,
                SUM(CASE WHEN type = "withdrawal" THEN amount ELSE 0 END) as withdrawals,
                SUM(CASE WHEN type = "investment" THEN amount ELSE 0 END) as investments,
                COUNT(*) as transaction_count
            ')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'recent_transactions' => $recentTransactions,
                'monthly_stats' => $monthlyStats
            ]
        ]);
    }
}
