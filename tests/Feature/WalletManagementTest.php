<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class WalletManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed payment methods
        $this->seed(\Database\Seeders\PaymentMethodSeeder::class);
    }

    public function test_wallet_is_created_with_user()
    {
        $user = User::factory()->create();
        
        $this->assertInstanceOf(Wallet::class, $user->wallet);
        $this->assertEquals(0, $user->wallet->balance);
        $this->assertEquals(0, $user->wallet->total_deposits);
        $this->assertEquals(0, $user->wallet->total_withdrawals);
        $this->assertEquals('active', $user->wallet->status);
    }

    public function test_deposit_with_valid_data()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        
        $response = $this->actingAs($user)->post('/wallet/deposit', [
            'amount' => 1000,
            'payment_method_id' => $paymentMethod->id,
            'payment_mode' => 'bank_transfer',
            'payment_reference' => 'TEST123',
            'auto_approve' => true,
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'deposit',
            'amount' => 1000,
            'status' => 'completed',
        ]);
        
        $user->refresh();
        $this->assertEquals(1000, $user->wallet->balance);
        $this->assertEquals(1000, $user->wallet->total_deposits);
    }

    public function test_deposit_with_minimum_amount()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        
        $response = $this->actingAs($user)->post('/wallet/deposit', [
            'amount' => 500, // Minimum amount
            'payment_method_id' => $paymentMethod->id,
            'payment_mode' => 'bank_transfer',
            'auto_approve' => true,
        ]);

        $response->assertStatus(200);
        
        $user->refresh();
        $this->assertEquals(500, $user->wallet->balance);
    }

    public function test_deposit_fails_with_insufficient_amount()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        
        $response = $this->actingAs($user)->post('/wallet/deposit', [
            'amount' => 499, // Below minimum
            'payment_method_id' => $paymentMethod->id,
            'payment_mode' => 'bank_transfer',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['amount']);
    }

    public function test_deposit_creates_pending_transaction()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        
        $response = $this->actingAs($user)->post('/wallet/deposit', [
            'amount' => 1000,
            'payment_method_id' => $paymentMethod->id,
            'payment_mode' => 'bank_transfer',
            'auto_approve' => false, // Don't auto-approve
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'deposit',
            'amount' => 1000,
            'status' => 'pending',
        ]);
        
        $user->refresh();
        $this->assertEquals(0, $user->wallet->balance); // Balance not updated
        $this->assertEquals(1000, $user->wallet->pending_amount); // Added to pending
    }

    public function test_withdrawal_with_sufficient_balance()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        $wallet->update(['balance' => 2000]);
        
        $paymentMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        
        $response = $this->actingAs($user)->post('/wallet/withdraw', [
            'amount' => 1000,
            'payment_method_id' => $paymentMethod->id,
            'payment_mode' => 'bank_transfer',
            'bank_account' => '1234567890',
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'withdrawal',
            'amount' => 1000,
            'status' => 'pending',
        ]);
        
        $wallet->refresh();
        $this->assertEquals(1000, $wallet->frozen_amount);
    }

    public function test_withdrawal_fails_with_insufficient_balance()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        $wallet->update(['balance' => 300]); // Less than withdrawal amount
        
        $paymentMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        
        $response = $this->actingAs($user)->post('/wallet/withdraw', [
            'amount' => 500,
            'payment_method_id' => $paymentMethod->id,
            'payment_mode' => 'bank_transfer',
            'bank_account' => '1234567890',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Insufficient balance'
        ]);
    }

    public function test_transaction_approval_updates_balance()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        
        // Create a pending deposit transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'deposit',
            'amount' => 1000,
            'net_amount' => 1000,
            'status' => 'pending',
        ]);
        
        // Add to pending amount
        $wallet->addPendingAmount(1000);
        
        // Approve the transaction
        $response = $this->actingAs($user)->put("/wallet/transactions/{$transaction->id}/approve");
        
        $response->assertStatus(200);
        
        $transaction->refresh();
        $wallet->refresh();
        
        $this->assertEquals('completed', $transaction->status);
        $this->assertEquals(1000, $wallet->balance);
        $this->assertEquals(0, $wallet->pending_amount);
    }

    public function test_transaction_rejection_reverses_pending_amount()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        
        // Create a pending deposit transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'deposit',
            'amount' => 1000,
            'net_amount' => 1000,
            'status' => 'pending',
        ]);
        
        // Add to pending amount
        $wallet->addPendingAmount(1000);
        
        // Reject the transaction
        $response = $this->actingAs($user)->put("/wallet/transactions/{$transaction->id}/reject", [
            'rejection_reason' => 'Invalid payment reference'
        ]);
        
        $response->assertStatus(200);
        
        $transaction->refresh();
        $wallet->refresh();
        
        $this->assertEquals('rejected', $transaction->status);
        $this->assertEquals('Invalid payment reference', $transaction->rejection_reason);
        $this->assertEquals(0, $wallet->pending_amount);
    }

    public function test_payment_method_validation()
    {
        $user = User::factory()->create();
        
        // Test with invalid payment method
        $response = $this->actingAs($user)->post('/wallet/deposit', [
            'amount' => 1000,
            'payment_method_id' => 999, // Non-existent payment method
            'payment_mode' => 'bank_transfer',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['payment_method_id']);
    }

    public function test_wallet_summary_calculation()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        
        // Add some transactions
        Transaction::factory()->create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'deposit',
            'amount' => 1000,
            'status' => 'completed',
        ]);
        
        Transaction::factory()->create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'withdrawal',
            'amount' => 300,
            'status' => 'completed',
        ]);
        
        $response = $this->actingAs($user)->get('/wallet/summary');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'summary' => [
                    'total_transactions',
                    'completed_transactions',
                    'total_deposits',
                    'total_withdrawals',
                    'current_balance'
                ]
            ]
        ]);
    }

    public function test_available_balance_calculation()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        
        // Set some amounts
        $wallet->update([
            'balance' => 2000,
            'frozen_amount' => 500,
            'pending_amount' => 200,
        ]);
        
        $this->assertEquals(1300, $wallet->getAvailableBalance());
        $this->assertTrue($wallet->canWithdraw(1300));
        $this->assertFalse($wallet->canWithdraw(1301));
    }

    public function test_processing_fee_calculation()
    {
        $paymentMethod = PaymentMethod::where('code', 'online')->first(); // 1.5% percentage
        
        $this->assertEquals(15, $paymentMethod->calculateProcessingFee(1000));
        $this->assertEquals(985, $paymentMethod->getNetAmount(1000));
        
        $fixedFeeMethod = PaymentMethod::where('code', 'cash')->first(); // ₹10 fixed
        $this->assertEquals(10, $fixedFeeMethod->calculateProcessingFee(1000));
        $this->assertEquals(990, $fixedFeeMethod->getNetAmount(1000));
    }

    public function test_transaction_history_filtering()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        
        // Create transactions of different types
        Transaction::factory()->create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'deposit',
            'amount' => 1000,
            'status' => 'completed',
            'created_at' => now()->subDays(5),
        ]);
        
        Transaction::factory()->create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'withdrawal',
            'amount' => 300,
            'status' => 'completed',
            'created_at' => now()->subDays(3),
        ]);
        
        // Test filtering by type
        $response = $this->actingAs($user)->get('/wallet/history?type=deposit');
        
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals(1, $data['total']); // Only deposit transactions
    }

    public function test_monthly_statistics()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        
        // Create transactions over different months
        Transaction::factory()->create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'deposit',
            'amount' => 1000,
            'status' => 'completed',
            'created_at' => now()->subMonth(),
        ]);
        
        Transaction::factory()->create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'deposit',
            'amount' => 500,
            'status' => 'completed',
            'created_at' => now(),
        ]);
        
        $response = $this->actingAs($user)->get('/wallet/summary');
        
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertArrayHasKey('monthly_stats', $data);
        $this->assertNotEmpty($data['monthly_stats']);
    }
}
