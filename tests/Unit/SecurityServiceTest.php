<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\SecurityService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class SecurityServiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_encrypt_and_decrypt_data()
    {
        $originalData = 'Sensitive information';
        
        $encrypted = SecurityService::encrypt($originalData);
        $decrypted = SecurityService::decrypt($encrypted);
        
        $this->assertEquals($originalData, $decrypted);
        $this->assertNotEquals($originalData, $encrypted);
    }

    /** @test */
    public function it_can_encrypt_and_decrypt_array_data()
    {
        $originalData = [
            'amount' => 1000.50,
            'reference' => 'TEST_123',
            'user_id' => 1
        ];
        
        $encrypted = SecurityService::encrypt($originalData);
        $decrypted = SecurityService::decrypt($encrypted);
        
        $this->assertEquals($originalData, $decrypted);
    }

    /** @test */
    public function it_can_hash_and_verify_password()
    {
        $password = 'SecurePassword123!';
        
        $hashed = SecurityService::hashPassword($password);
        $isValid = SecurityService::verifyPassword($password, $hashed);
        
        $this->assertTrue($isValid);
        $this->assertNotEquals($password, $hashed);
    }

    /** @test */
    public function it_rejects_invalid_password_verification()
    {
        $password = 'SecurePassword123!';
        $wrongPassword = 'WrongPassword123!';
        
        $hashed = SecurityService::hashPassword($password);
        $isValid = SecurityService::verifyPassword($wrongPassword, $hashed);
        
        $this->assertFalse($isValid);
    }

    /** @test */
    public function it_generates_secure_tokens()
    {
        $token1 = SecurityService::generateToken();
        $token2 = SecurityService::generateToken();
        
        $this->assertEquals(32, strlen($token1));
        $this->assertEquals(32, strlen($token2));
        $this->assertNotEquals($token1, $token2);
    }

    /** @test */
    public function it_generates_api_keys()
    {
        $apiKey = SecurityService::generateApiKey();
        
        $this->assertStringStartsWith('pk_', $apiKey);
        $this->assertEquals(35, strlen($apiKey)); // pk_ + 32 chars
    }

    /** @test */
    public function it_generates_reference_numbers()
    {
        $ref1 = SecurityService::generateReferenceNumber();
        $ref2 = SecurityService::generateReferenceNumber('INV');
        
        $this->assertStringStartsWith('REF_', $ref1);
        $this->assertStringStartsWith('INV_', $ref2);
        $this->assertNotEquals($ref1, $ref2);
    }

    /** @test */
    public function it_validates_transaction_amount()
    {
        // Valid amount
        $errors = SecurityService::validateTransactionAmount(100, 1000);
        $this->assertEmpty($errors);
        
        // Negative amount
        $errors = SecurityService::validateTransactionAmount(-100, 1000);
        $this->assertContains('Amount must be greater than zero', $errors);
        
        // Insufficient balance
        $errors = SecurityService::validateTransactionAmount(1500, 1000);
        $this->assertContains('Insufficient balance', $errors);
    }

    /** @test */
    public function it_validates_user_data()
    {
        // Valid data
        $validData = [
            'email' => 'test@example.com',
            'name' => 'John Doe',
            'phone' => '+1234567890'
        ];
        
        $errors = SecurityService::validateUserData($validData);
        $this->assertEmpty($errors);
        
        // Invalid email
        $invalidData = [
            'email' => 'invalid-email',
            'name' => 'John Doe',
            'phone' => '+1234567890'
        ];
        
        $errors = SecurityService::validateUserData($invalidData);
        $this->assertContains('Invalid email format', $errors);
        
        // Invalid phone
        $invalidData = [
            'email' => 'test@example.com',
            'name' => 'John Doe',
            'phone' => '123'
        ];
        
        $errors = SecurityService::validateUserData($invalidData);
        $this->assertContains('Invalid phone number format', $errors);
        
        // Invalid name
        $invalidData = [
            'email' => 'test@example.com',
            'name' => 'A', // Too short
            'phone' => '+1234567890'
        ];
        
        $errors = SecurityService::validateUserData($invalidData);
        $this->assertContains('Name must be between 2 and 100 characters', $errors);
    }

    /** @test */
    public function it_validates_investment_data()
    {
        $user = User::factory()->create();
        $wallet = $user->wallet()->create(['balance' => 10000]);
        
        // Valid investment
        $validData = [
            'amount' => 1000,
            'property_project_id' => 1
        ];
        
        $errors = SecurityService::validateInvestmentData($validData, $user);
        $this->assertEmpty($errors);
        
        // Invalid amount
        $invalidData = [
            'amount' => -100,
            'property_project_id' => 1
        ];
        
        $errors = SecurityService::validateInvestmentData($invalidData, $user);
        $this->assertContains('Investment amount must be greater than zero', $errors);
        
        // Insufficient balance
        $invalidData = [
            'amount' => 20000,
            'property_project_id' => 1
        ];
        
        $errors = SecurityService::validateInvestmentData($invalidData, $user);
        $this->assertContains('Insufficient wallet balance', $errors);
    }

    /** @test */
    public function it_detects_suspicious_activity()
    {
        $user = User::factory()->create();
        
        // Normal activity should not be suspicious
        $suspicious = SecurityService::detectSuspiciousActivity($user, 'login');
        $this->assertEmpty($suspicious);
        
        // Simulate rapid successive actions
        for ($i = 0; $i < 15; $i++) {
            SecurityService::logSecurityEvent('login_attempt', [], $user);
        }
        
        $suspicious = SecurityService::detectSuspiciousActivity($user, 'login_attempt');
        $this->assertContains('High frequency actions detected', $suspicious);
    }

    /** @test */
    public function it_checks_account_lock_status()
    {
        $user = User::factory()->create();
        
        // New account should not be locked
        $this->assertFalse(SecurityService::isAccountLocked($user));
        
        // Simulate failed login attempts
        for ($i = 0; $i < 6; $i++) {
            SecurityService::logSecurityEvent('login_failed', [], $user);
        }
        
        // Account should be locked after too many failed attempts
        $this->assertTrue(SecurityService::isAccountLocked($user));
    }

    /** @test */
    public function it_can_lock_and_unlock_accounts()
    {
        $user = User::factory()->create();
        
        // Lock account
        SecurityService::lockAccount($user, 'Test lock');
        $user->refresh();
        
        $this->assertTrue($user->is_locked);
        $this->assertEquals('Test lock', $user->lock_reason);
        
        // Unlock account
        SecurityService::unlockAccount($user);
        $user->refresh();
        
        $this->assertFalse($user->is_locked);
        $this->assertNull($user->lock_reason);
    }

    /** @test */
    public function it_validates_api_requests()
    {
        // Valid API request
        $validHeaders = [
            'X-API-Key' => 'test_api_key',
            'Content-Type' => 'application/json',
            'Content-Length' => '1000'
        ];
        
        $validData = ['test' => 'data'];
        
        $errors = SecurityService::validateApiRequest($validHeaders, $validData);
        $this->assertEmpty($errors);
        
        // Missing API key
        $invalidHeaders = [
            'Content-Type' => 'application/json',
            'Content-Length' => '1000'
        ];
        
        $errors = SecurityService::validateApiRequest($invalidHeaders, $validData);
        $this->assertContains('API key is required', $errors);
        
        // Wrong content type
        $invalidHeaders = [
            'X-API-Key' => 'test_api_key',
            'Content-Type' => 'text/plain',
            'Content-Length' => '1000'
        ];
        
        $errors = SecurityService::validateApiRequest($invalidHeaders, $validData);
        $this->assertContains('Content-Type must be application/json', $errors);
    }

    /** @test */
    public function it_generates_compliance_reports()
    {
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();
        
        $report = SecurityService::generateComplianceReport($startDate, $endDate);
        
        $this->assertArrayHasKey('period', $report);
        $this->assertArrayHasKey('user_activity', $report);
        $this->assertArrayHasKey('transactions', $report);
        $this->assertArrayHasKey('security_events', $report);
        $this->assertArrayHasKey('compliance_metrics', $report);
        
        $this->assertEquals($startDate->format('Y-m-d'), $report['period']['start_date']);
        $this->assertEquals($endDate->format('Y-m-d'), $report['period']['end_date']);
    }

    /** @test */
    public function it_sanitizes_input_data()
    {
        // String with HTML tags
        $input = '<script>alert("xss")</script>Hello World';
        $sanitized = SecurityService::sanitizeInput($input);
        
        $this->assertEquals('alert("xss")Hello World', $sanitized);
        $this->assertStringNotContainsString('<script>', $sanitized);
        
        // Array with mixed data
        $inputArray = [
            'name' => '<b>John</b>',
            'email' => 'test@example.com',
            'nested' => [
                'value' => '<script>alert("xss")</script>'
            ]
        ];
        
        $sanitizedArray = SecurityService::sanitizeInput($inputArray);
        
        $this->assertEquals('John', $sanitizedArray['name']);
        $this->assertEquals('test@example.com', $sanitizedArray['email']);
        $this->assertEquals('alert("xss")', $sanitizedArray['nested']['value']);
    }

    /** @test */
    public function it_validates_file_uploads()
    {
        // Create a mock file
        $file = $this->createMockFile('test.jpg', 'image/jpeg', 1024);
        
        $errors = SecurityService::validateFileUpload($file);
        $this->assertEmpty($errors);
        
        // Test file too large
        $largeFile = $this->createMockFile('large.jpg', 'image/jpeg', 10485760);
        
        $errors = SecurityService::validateFileUpload($largeFile, [], 5242880);
        $this->assertContains('File size exceeds maximum limit', $errors);
        
        // Test invalid file type
        $invalidFile = $this->createMockFile('test.exe', 'application/octet-stream', 1024);
        
        $errors = SecurityService::validateFileUpload($invalidFile);
        $this->assertContains('File type not allowed', $errors);
    }

    private function createMockFile($name, $mimeType, $size)
    {
        $file = new \stdClass();
        $file->name = $name;
        $file->getClientOriginalName = $name;
        $file->getMimeType = $mimeType;
        $file->getSize = $size;
        $file->getClientOriginalExtension = pathinfo($name, PATHINFO_EXTENSION);
        $file->getPathname = tempnam(sys_get_temp_dir(), 'test');
        
        // Write some content to the file
        file_put_contents($file->getPathname(), str_repeat('x', $size));
        
        return $file;
    }
}
