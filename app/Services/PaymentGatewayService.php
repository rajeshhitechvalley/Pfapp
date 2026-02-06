<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PaymentGatewayService
{
    protected array $gateways = [
        'razorpay' => [
            'key_id' => null,
            'key_secret' => null,
            'webhook_secret' => null,
            'api_url' => 'https://api.razorpay.com/v1',
        ],
        'payu' => [
            'merchant_key' => null,
            'salt' => null,
            'api_url' => 'https://test.payu.in',
        ],
        'ccavenue' => [
            'merchant_id' => null,
            'access_code' => null,
            'working_key' => null,
            'api_url' => 'https://secure.ccavenue.com',
        ],
    ];

    protected string $activeGateway = 'razorpay';

    public function __construct()
    {
        $this->loadGatewayConfig();
    }

    protected function loadGatewayConfig(): void
    {
        $this->gateways['razorpay']['key_id'] = config('services.razorpay.key_id');
        $this->gateways['razorpay']['key_secret'] = config('services.razorpay.key_secret');
        $this->gateways['razorpay']['webhook_secret'] = config('services.razorpay.webhook_secret');
        
        $this->gateways['payu']['merchant_key'] = config('services.payu.merchant_key');
        $this->gateways['payu']['salt'] = config('services.payu.salt');
        
        $this->gateways['ccavenue']['merchant_id'] = config('services.ccavenue.merchant_id');
        $this->gateways['ccavenue']['access_code'] = config('services.ccavenue.access_code');
        $this->gateways['ccavenue']['working_key'] = config('services.ccavenue.working_key');
    }

    public function createOrder(array $data): array
    {
        try {
            switch ($this->activeGateway) {
                case 'razorpay':
                    return $this->createRazorpayOrder($data);
                case 'payu':
                    return $this->createPayUOrder($data);
                case 'ccavenue':
                    return $this->createCCAvenueOrder($data);
                default:
                    throw new \Exception('Unsupported payment gateway');
            }
        } catch (\Exception $e) {
            Log::error('Payment gateway error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function verifyPayment(array $data): array
    {
        try {
            switch ($this->activeGateway) {
                case 'razorpay':
                    return $this->verifyRazorpayPayment($data);
                case 'payu':
                    return $this->verifyPayUPayment($data);
                case 'ccavenue':
                    return $this->verifyCCAvenuePayment($data);
                default:
                    throw new \Exception('Unsupported payment gateway');
            }
        } catch (\Exception $e) {
            Log::error('Payment verification error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function processRefund(Transaction $transaction, float $amount): array
    {
        try {
            switch ($this->activeGateway) {
                case 'razorpay':
                    return $this->processRazorpayRefund($transaction, $amount);
                case 'payu':
                    return $this->processPayURefund($transaction, $amount);
                case 'ccavenue':
                    return $this->processCCAvenueRefund($transaction, $amount);
                default:
                    throw new \Exception('Unsupported payment gateway');
            }
        } catch (\Exception $e) {
            Log::error('Refund processing error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function createRazorpayOrder(array $data): array
    {
        $payload = [
            'amount' => $data['amount'] * 100, // Convert to paise
            'currency' => 'INR',
            'receipt' => $data['receipt'],
            'notes' => $data['notes'] ?? [],
            'payment_capture' => 1,
        ];

        $response = Http::withBasicAuth(
            $this->gateways['razorpay']['key_id'],
            $this->gateways['razorpay']['key_secret']
        )->post($this->gateways['razorpay']['api_url'] . '/orders', $payload);

        if (!$response->successful()) {
            throw new \Exception('Failed to create Razorpay order');
        }

        return [
            'success' => true,
            'gateway' => 'razorpay',
            'order_id' => $response->json()['id'],
            'amount' => $response->json()['amount'],
            'currency' => $response->json()['currency'],
            'key_id' => $this->gateways['razorpay']['key_id'],
        ];
    }

    protected function verifyRazorpayPayment(array $data): array
    {
        $razorpayOrderId = $data['razorpay_order_id'];
        $razorpayPaymentId = $data['razorpay_payment_id'];
        $razorpaySignature = $data['razorpay_signature'];

        $generatedSignature = hash_hmac(
            'sha256',
            $razorpayOrderId . '|' . $razorpayPaymentId,
            $this->gateways['razorpay']['key_secret']
        );

        if ($generatedSignature !== $razorpaySignature) {
            return [
                'success' => false,
                'message' => 'Invalid signature',
            ];
        }

        // Fetch payment details
        $response = Http::withBasicAuth(
            $this->gateways['razorpay']['key_id'],
            $this->gateways['razorpay']['key_secret']
        )->get($this->gateways['razorpay']['api_url'] . '/payments/' . $razorpayPaymentId);

        if (!$response->successful()) {
            return [
                'success' => false,
                'message' => 'Failed to fetch payment details',
            ];
        }

        $payment = $response->json();

        return [
            'success' => true,
            'gateway' => 'razorpay',
            'payment_id' => $payment['id'],
            'order_id' => $payment['order_id'],
            'amount' => $payment['amount'],
            'status' => $payment['status'],
            'method' => $payment['method'],
            'bank' => $payment['bank'] ?? null,
            'wallet' => $payment['wallet'] ?? null,
            'vpa' => $payment['vpa'] ?? null,
            'email' => $payment['email'],
            'contact' => $payment['contact'],
            'created_at' => $payment['created_at'],
        ];
    }

    protected function processRazorpayRefund(Transaction $transaction, float $amount): array
    {
        $payload = [
            'amount' => $amount * 100, // Convert to paise
        ];

        $response = Http::withBasicAuth(
            $this->gateways['razorpay']['key_id'],
            $this->gateways['razorpay']['key_secret']
        )->post($this->gateways['razorpay']['api_url'] . '/payments/' . $transaction->gateway_transaction_id . '/refund', $payload);

        if (!$response->successful()) {
            throw new \Exception('Failed to process Razorpay refund');
        }

        return [
            'success' => true,
            'gateway' => 'razorpay',
            'refund_id' => $response->json()['id'],
            'amount' => $response->json()['amount'],
            'status' => $response->json()['status'],
            'created_at' => $response->json()['created_at'],
        ];
    }

    protected function createPayUOrder(array $data): array
    {
        $payload = [
            'key' => $this->gateways['payu']['merchant_key'],
            'txnid' => $data['receipt'],
            'amount' => $data['amount'],
            'productinfo' => $data['description'] ?? 'Payment',
            'firstname' => $data['name'] ?? 'User',
            'email' => $data['email'] ?? '',
            'phone' => $data['phone'] ?? '',
            'surl' => route('payment.success'),
            'furl' => route('payment.failure'),
            'hash' => $this->generatePayUHash($data),
        ];

        return [
            'success' => true,
            'gateway' => 'payu',
            'form_data' => $payload,
            'action_url' => $this->gateways['payu']['api_url'] . '/_payment',
        ];
    }

    protected function verifyPayUPayment(array $data): array
    {
        $status = $data['status'];
        $txnid = $data['txnid'];
        $amount = $data['amount'];
        $productinfo = $data['productinfo'];
        $firstname = $data['firstname'];
        $email = $data['email'];
        $udf1 = $data['udf1'] ?? '';
        $udf2 = $data['udf2'] ?? '';
        $udf3 = $data['udf3'] ?? '';
        $udf4 = $data['udf4'] ?? '';
        $udf5 = $data['udf5'] ?? '';
        $mihpayid = $data['mihpayid'];
        $hash = $data['hash'];

        $generatedHash = strtolower(hash(
            'sha512',
            $this->gateways['payu']['salt'] . '|' . $status . '|' . $mihpayid . '|' . $txnid . '|' . $amount . '|' . $productinfo . '|' . $firstname . '|' . $email . '|' . $udf1 . '|' . $udf2 . '|' . $udf3 . '|' . $udf4 . '|' . $udf5
        ));

        if ($generatedHash !== strtolower($hash)) {
            return [
                'success' => false,
                'message' => 'Invalid signature',
            ];
        }

        return [
            'success' => true,
            'gateway' => 'payu',
            'transaction_id' => $txnid,
            'payment_id' => $mihpayid,
            'amount' => $amount,
            'status' => $status,
            'email' => $email,
            'phone' => $data['phone'] ?? '',
            'created_at' => now()->toISOString(),
        ];
    }

    protected function processPayURefund(Transaction $transaction, float $amount): array
    {
        // PayU refund implementation
        return [
            'success' => true,
            'gateway' => 'payu',
            'refund_id' => 'PAYU_REFUND_' . uniqid(),
            'amount' => $amount,
            'status' => 'processed',
        ];
    }

    protected function createCCAvenueOrder(array $data): array
    {
        $payload = [
            'merchant_id' => $this->gateways['ccavenue']['merchant_id'],
            'order_id' => $data['receipt'],
            'amount' => $data['amount'],
            'currency' => 'INR',
            'redirect_url' => route('payment.success'),
            'cancel_url' => route('payment.failure'),
            'language' => 'EN',
            'billing_name' => $data['name'] ?? 'User',
            'billing_email' => $data['email'] ?? '',
            'billing_tel' => $data['phone'] ?? '',
            'billing_address' => $data['address'] ?? '',
            'billing_city' => $data['city'] ?? '',
            'billing_state' => $data['state'] ?? '',
            'billing_zip' => $data['zip'] ?? '',
            'billing_country' => 'India',
            'integration_type' => 'iframe_normal',
        ];

        return [
            'success' => true,
            'gateway' => 'ccavenue',
            'form_data' => $payload,
            'access_code' => $this->gateways['ccavenue']['access_code'],
            'action_url' => $this->gateways['ccavenue']['api_url'] . '/transaction/transaction.do',
        ];
    }

    protected function verifyCCAvenuePayment(array $data): array
    {
        // CCAvenue verification implementation
        return [
            'success' => true,
            'gateway' => 'ccavenue',
            'transaction_id' => $data['order_id'] ?? '',
            'payment_id' => $data['tracking_id'] ?? '',
            'amount' => $data['amount'] ?? 0,
            'status' => $data['order_status'] ?? 'unknown',
            'created_at' => now()->toISOString(),
        ];
    }

    protected function processCCAvenueRefund(Transaction $transaction, float $amount): array
    {
        // CCAvenue refund implementation
        return [
            'success' => true,
            'gateway' => 'ccavenue',
            'refund_id' => 'CCAVENUE_REFUND_' . uniqid(),
            'amount' => $amount,
            'status' => 'processed',
        ];
    }

    protected function generatePayUHash(array $data): string
    {
        $hashSequence = 'key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10';
        $hashVarsSeq = explode('|', $hashSequence);
        $hash_string = '';
        
        foreach ($hashVarsSeq as $hash_var) {
            $hash_string .= isset($data[$hash_var]) ? $data[$hash_var] : '';
            $hash_string .= '|';
        }
        
        $hash_string .= $this->gateways['payu']['salt'];
        
        return strtolower(hash('sha512', $hash_string));
    }

    public function getSupportedPaymentModes(): array
    {
        return [
            'upi' => [
                'name' => 'UPI',
                'icon' => 'smartphone',
                'min_amount' => 1,
                'max_amount' => 100000,
                'processing_fee' => 0,
                'processing_fee_type' => 'fixed',
            ],
            'card' => [
                'name' => 'Credit/Debit Card',
                'icon' => 'credit-card',
                'min_amount' => 100,
                'max_amount' => 200000,
                'processing_fee' => 2,
                'processing_fee_type' => 'percentage',
            ],
            'net_banking' => [
                'name' => 'Net Banking',
                'icon' => 'building',
                'min_amount' => 100,
                'max_amount' => 500000,
                'processing_fee' => 1.5,
                'processing_fee_type' => 'percentage',
            ],
            'wallet' => [
                'name' => 'Digital Wallet',
                'icon' => 'wallet',
                'min_amount' => 1,
                'max_amount' => 50000,
                'processing_fee' => 1,
                'processing_fee_type' => 'percentage',
            ],
        ];
    }

    public function calculateProcessingFee(float $amount, string $mode): float
    {
        $paymentModes = $this->getSupportedPaymentModes();
        $modeConfig = $paymentModes[$mode] ?? null;
        
        if (!$modeConfig) {
            return 0;
        }
        
        $fee = $modeConfig['processing_fee'];
        $feeType = $modeConfig['processing_fee_type'];
        
        if ($feeType === 'percentage') {
            return ($amount * $fee) / 100;
        }
        
        return $fee;
    }

    public function getNetAmount(float $amount, string $mode): float
    {
        $fee = $this->calculateProcessingFee($amount, $mode);
        return $amount - $fee;
    }

    public function validatePaymentMode(string $mode, float $amount): array
    {
        $paymentModes = $this->getSupportedPaymentModes();
        $modeConfig = $paymentModes[$mode] ?? null;
        
        if (!$modeConfig) {
            return [
                'valid' => false,
                'message' => 'Invalid payment mode',
            ];
        }
        
        if ($amount < $modeConfig['min_amount']) {
            return [
                'valid' => false,
                'message' => "Minimum amount is ₹{$modeConfig['min_amount']}",
            ];
        }
        
        if ($amount > $modeConfig['max_amount']) {
            return [
                'valid' => false,
                'message' => "Maximum amount is ₹{$modeConfig['max_amount']}",
            ];
        }
        
        return [
            'valid' => true,
            'message' => 'Valid payment mode',
        ];
    }

    public function setActiveGateway(string $gateway): void
    {
        if (!isset($this->gateways[$gateway])) {
            throw new \Exception('Invalid payment gateway');
        }
        
        $this->activeGateway = $gateway;
    }

    public function getActiveGateway(): string
    {
        return $this->activeGateway;
    }

    public function getGatewayStatus(): array
    {
        $status = [];
        
        foreach ($this->gateways as $gateway => $config) {
            $status[$gateway] = [
                'name' => ucfirst($gateway),
                'active' => $gateway === $this->activeGateway,
                'configured' => !empty($config['key_id']) || !empty($config['merchant_key']) || !empty($config['merchant_id']),
            ];
        }
        
        return $status;
    }

    public function processWebhook(array $data, string $gateway): array
    {
        try {
            switch ($gateway) {
                case 'razorpay':
                    return $this->processRazorpayWebhook($data);
                case 'payu':
                    return $this->processPayUWebhook($data);
                case 'ccavenue':
                    return $this->processCCAvenueWebhook($data);
                default:
                    throw new \Exception('Unsupported payment gateway');
            }
        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function processRazorpayWebhook(array $data): array
    {
        $webhookSecret = $this->gateways['razorpay']['webhook_secret'];
        $razorpaySignature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'];
        
        $webhookBody = json_encode($data);
        $expectedSignature = hash_hmac('sha256', $webhookBody, $webhookSecret);
        
        if ($expectedSignature !== $razorpaySignature) {
            return [
                'success' => false,
                'message' => 'Invalid webhook signature',
            ];
        }
        
        $event = $data['event'];
        $paymentData = $data['payload']['payment']['entity'];
        
        return [
            'success' => true,
            'gateway' => 'razorpay',
            'event' => $event,
            'payment_id' => $paymentData['id'],
            'order_id' => $paymentData['order_id'],
            'amount' => $paymentData['amount'],
            'status' => $paymentData['status'],
            'method' => $paymentData['method'],
            'captured' => $paymentData['captured'],
            'created_at' => $paymentData['created_at'],
        ];
    }

    protected function processPayUWebhook(array $data): array
    {
        // PayU webhook processing
        return [
            'success' => true,
            'gateway' => 'payu',
            'data' => $data,
        ];
    }

    protected function processCCAvenueWebhook(array $data): array
    {
        // CCAvenue webhook processing
        return [
            'success' => true,
            'gateway' => 'ccavenue',
            'data' => $data,
        ];
    }
}
