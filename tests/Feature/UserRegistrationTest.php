<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Team;
use App\Models\KycDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_registration_with_valid_data()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'investor',
            'address' => '123 Main St, Mumbai, India',
            'date_of_birth' => '1990-01-01',
            'pan_number' => 'ABCDE1234F',
            'aadhar_number' => '123456789012',
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '9876543210',
            'role' => 'investor',
            'status' => 'inactive',
            'kyc_verified' => false,
            'registration_fee_paid' => 0,
            'registration_approved' => false,
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => 1,
            'balance' => 0,
            'status' => 'active',
        ]);

        $user = User::first();
        $this->assertNotNull($user->referral_code);
        $this->assertStringStartsWith($user->referral_code, 'REF');
        $this->assertEquals(9, strlen($user->referral_code));
    }

    public function test_user_registration_with_invalid_email()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'investor',
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(422);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_user_registration_with_duplicate_email()
    {
        User::factory()->create(['email' => 'john@example.com']);

        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'investor',
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(422);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_user_registration_with_weak_password()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => '123',
            'password_confirmation' => '123',
            'phone' => '9876543210',
            'role' => 'investor',
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(422);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_user_registration_with_referral()
    {
        $referrer = User::factory()->create();
        
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'investor',
            'referred_by' => $referrer->id,
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'referred_by' => $referrer->id,
        ]);
    }

    public function test_user_registration_creates_wallet()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'investor',
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(201);
        
        $user = User::first();
        $this->assertInstanceOf(Wallet::class, $user->wallet);
        $this->assertEquals(0, $user->wallet->balance);
        $this->assertEquals('active', $user->wallet->status);
    }

    public function test_user_registration_with_team_leader_role()
    {
        $userData = [
            'name' => 'Team Leader',
            'email' => 'leader@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'team_leader',
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'leader@example.com',
            'role' => 'team_leader',
        ]);
    }

    public function test_user_registration_with_admin_role()
    {
        $userData = [
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'admin',
        ];

        $response = $this->post('/users', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);
    }

    public function test_user_registration_password_is_hashed()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'investor',
        ];

        $this->post('/users', $userData);

        $user = User::first();
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertNotEquals('password123', $user->password);
    }

    public function test_user_registration_creates_unique_referral_code()
    {
        $userData1 = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'role' => 'investor',
        ];

        $userData2 = [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543211',
            'role' => 'investor',
        ];

        $this->post('/users', $userData1);
        $this->post('/users', $userData2);

        $users = User::all();
        $this->assertEquals(2, $users->count());
        $this->assertNotEquals($users[0]->referral_code, $users[1]->referral_code);
    }
}

class UserActivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_activation_requires_registration_fee()
    {
        $user = User::factory()->create([
            'registration_fee_paid' => 0,
            'status' => 'inactive',
        ]);

        $response = $this->post("/users/{$user->id}/activate");

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Registration fee must be paid before activation'
        ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'inactive',
        ]);
    }

    public function test_user_activation_requires_complete_team()
    {
        $user = User::factory()->create([
            'registration_fee_paid' => 500,
            'status' => 'inactive',
        ]);

        $team = Team::factory()->create([
            'team_leader_id' => $user->id,
            'member_count' => 15, // Less than required 20
        ]);

        $response = $this->post("/users/{$user->id}/activate");

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Team must have at least 20 members before activation'
        ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'inactive',
        ]);
    }

    public function test_user_activation_success()
    {
        $user = User::factory()->create([
            'registration_fee_paid' => 500,
            'status' => 'inactive',
        ]);

        $team = Team::factory()->create([
            'team_leader_id' => $user->id,
            'member_count' => 20,
        ]);

        $response = $this->post("/users/{$user->id}/activate");

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'active',
            'registration_approved' => true,
        ]);
    }

    public function test_user_activation_activates_team()
    {
        $user = User::factory()->create([
            'registration_fee_paid' => 500,
            'status' => 'inactive',
        ]);

        $team = Team::factory()->create([
            'team_leader_id' => $user->id,
            'member_count' => 20,
            'status' => 'pending',
        ]);

        $this->post("/users/{$user->id}/activate");

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'status' => 'active',
        ]);
    }
}

class KycManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_kyc_document_upload()
    {
        $user = User::factory()->create();
        
        $file = \Illuminate\Http\UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');
        
        $response = $this->post("/users/{$user->id}/kyc-documents", [
            'document_type' => 'pan_card',
            'document' => $file,
            'document_name' => 'PAN Card',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('kyc_documents', [
            'user_id' => $user->id,
            'document_type' => 'pan_card',
            'document_name' => 'PAN Card',
            'status' => 'pending',
        ]);
    }

    public function test_kyc_document_verification()
    {
        $user = User::factory()->create();
        $document = KycDocument::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $response = $this->put("/kyc-documents/{$document->id}", [
            'status' => 'approved',
            'notes' => 'Document verified successfully',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('kyc_documents', [
            'id' => $document->id,
            'status' => 'approved',
            'notes' => 'Document verified successfully',
        ]);
    }

    public function test_kyc_completion_check()
    {
        $user = User::factory()->create();
        
        // Create all required documents
        KycDocument::factory()->create([
            'user_id' => $user->id,
            'document_type' => 'pan_card',
            'status' => 'approved',
        ]);
        
        KycDocument::factory()->create([
            'user_id' => $user->id,
            'document_type' => 'aadhar_card',
            'status' => 'approved',
        ]);
        
        KycDocument::factory()->create([
            'user_id' => $user->id,
            'document_type' => 'address_proof',
            'status' => 'approved',
        ]);

        $this->assertTrue($user->isKycComplete());
        $this->assertTrue($user->kyc_verified);
    }

    public function test_registration_fee_payment()
    {
        $user = User::factory()->create();
        
        $response = $this->post("/users/{$user->id}/pay-registration-fee", [
            'amount' => 500,
            'payment_mode' => 'bank_transfer',
            'payment_reference' => 'TXN123456',
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'registration_fee_paid' => 500,
        ]);
        
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'deposit',
            'amount' => 500,
            'status' => 'completed',
        ]);
    }
}
