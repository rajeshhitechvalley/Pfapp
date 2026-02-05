<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = [
            [
                'name' => 'Bank Transfer',
                'code' => 'bank_transfer',
                'description' => 'Direct bank transfer to company account',
                'type' => 'both',
                'is_active' => true,
                'min_amount' => 500.00,
                'max_amount' => 1000000.00,
                'processing_fee' => 0.00,
                'processing_fee_type' => 'fixed',
                'sort_order' => 1,
                'settings' => [
                    'requires_account_details' => true,
                    'settlement_time' => '1-2 business days'
                ]
            ],
            [
                'name' => 'UPI Payment',
                'code' => 'upi',
                'description' => 'Unified Payments Interface transfer',
                'type' => 'both',
                'is_active' => true,
                'min_amount' => 500.00,
                'max_amount' => 100000.00,
                'processing_fee' => 0.00,
                'processing_fee_type' => 'fixed',
                'sort_order' => 2,
                'settings' => [
                    'requires_upi_id' => true,
                    'settlement_time' => 'Instant'
                ]
            ],
            [
                'name' => 'Cash Deposit',
                'code' => 'cash',
                'description' => 'Cash deposit at authorized centers',
                'type' => 'deposit',
                'is_active' => true,
                'min_amount' => 500.00,
                'max_amount' => 50000.00,
                'processing_fee' => 10.00,
                'processing_fee_type' => 'fixed',
                'sort_order' => 3,
                'settings' => [
                    'requires_receipt' => true,
                    'settlement_time' => 'Same day'
                ]
            ],
            [
                'name' => 'Cheque Deposit',
                'code' => 'cheque',
                'description' => 'Cheque deposit processing',
                'type' => 'deposit',
                'is_active' => true,
                'min_amount' => 500.00,
                'max_amount' => 100000.00,
                'processing_fee' => 25.00,
                'processing_fee_type' => 'fixed',
                'sort_order' => 4,
                'settings' => [
                    'requires_cheque_details' => true,
                    'settlement_time' => '3-5 business days'
                ]
            ],
            [
                'name' => 'Online Payment Gateway',
                'code' => 'online',
                'description' => 'Credit/Debit card and net banking',
                'type' => 'both',
                'is_active' => true,
                'min_amount' => 500.00,
                'max_amount' => 500000.00,
                'processing_fee' => 1.50,
                'processing_fee_type' => 'percentage',
                'sort_order' => 5,
                'settings' => [
                    'requires_card_details' => true,
                    'settlement_time' => 'Instant'
                ]
            ],
            [
                'name' => 'Wallet Transfer',
                'code' => 'wallet',
                'description' => 'Internal wallet to wallet transfer',
                'type' => 'both',
                'is_active' => true,
                'min_amount' => 100.00,
                'max_amount' => null,
                'processing_fee' => 0.00,
                'processing_fee_type' => 'fixed',
                'sort_order' => 6,
                'settings' => [
                    'requires_wallet_address' => true,
                    'settlement_time' => 'Instant'
                ]
            ],
        ];

        foreach ($paymentMethods as $method) {
            PaymentMethod::create($method);
        }
    }
}
