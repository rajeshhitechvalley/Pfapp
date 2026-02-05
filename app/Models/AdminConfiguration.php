<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AdminConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'category',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByKey($query, $key)
    {
        return $query->where('key', $key);
    }

    // Accessors
    public function getFormattedValueAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return $this->value ? 'Yes' : 'No';
            case 'number':
                return is_numeric($this->value) ? number_format($this->value, 2) : $this->value;
            case 'currency':
                return is_numeric($this->value) ? '₹' . number_format($this->value, 2) : $this->value;
            case 'percentage':
                return is_numeric($this->value) ? $this->value . '%' : $this->value;
            default:
                return $this->value;
        }
    }

    public function getTypedValueAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return filter_var($this->value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
            case 'currency':
            case 'percentage':
                return is_numeric($this->value) ? (float) $this->value : 0;
            case 'integer':
                return is_numeric($this->value) ? (int) $this->value : 0;
            default:
                return $this->value;
        }
    }

    // Business Logic Methods
    public static function getValue(string $key, $default = null)
    {
        $config = self::active()->byKey($key)->first();
        
        if ($config) {
            return $config->typed_value;
        }
        
        return $default;
    }

    public static function setValue(string $key, $value, string $type = 'string', string $category = 'general', string $description = null)
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'category' => $category,
                'description' => $description,
                'is_active' => true,
                'updated_by' => auth()->id(),
            ]
        );
    }

    public static function getInvestmentSettings(): array
    {
        return [
            'minimum_investment' => self::getValue('minimum_investment', 500),
            'maximum_investment' => self::getValue('maximum_investment', 1000000),
            'investment_approval_required' => self::getValue('investment_approval_required', false),
            'auto_approve_investments' => self::getValue('auto_approve_investments', false),
            'investment_fee_percentage' => self::getValue('investment_fee_percentage', 0),
            'investment_fee_fixed' => self::getValue('investment_fee_fixed', 0),
        ];
    }

    public static function getProfitSettings(): array
    {
        return [
            'company_profit_percentage' => self::getValue('company_profit_percentage', 20),
            'team_bonus_percentage' => self::getValue('team_bonus_percentage', 10),
            'minimum_profit_amount' => self::getValue('minimum_profit_amount', 0),
            'profit_distribution_frequency' => self::getValue('profit_distribution_frequency', 'monthly'),
            'auto_distribute_profits' => self::getValue('auto_distribute_profits', false),
        ];
    }

    public static function getTeamSettings(): array
    {
        return [
            'minimum_team_size' => self::getValue('minimum_team_size', 1),
            'maximum_team_size' => self::getValue('maximum_team_size', 50),
            'team_approval_required' => self::getValue('team_approval_required', false),
            'team_leader_bonus_percentage' => self::getValue('team_leader_bonus_percentage', 5),
            'team_member_bonus_percentage' => self::getValue('team_member_bonus_percentage', 2),
            'team_minimum_investment' => self::getValue('team_minimum_investment', 1000),
        ];
    }

    public static function getReinvestmentSettings(): array
    {
        return [
            'auto_reinvestment_enabled' => self::getValue('auto_reinvestment_enabled', false),
            'auto_reinvestment_percentage' => self::getValue('auto_reinvestment_percentage', 50),
            'minimum_reinvestment_amount' => self::getValue('minimum_reinvestment_amount', 100),
            'reinvestment_fee_percentage' => self::getValue('reinvestment_fee_percentage', 0),
            'reinvestment_approval_required' => self::getValue('reinvestment_approval_required', false),
        ];
    }

    public static function getWalletSettings(): array
    {
        return [
            'minimum_wallet_balance' => self::getValue('minimum_wallet_balance', 0),
            'maximum_wallet_balance' => self::getValue('maximum_wallet_balance', 10000000),
            'wallet_transaction_fee' => self::getValue('wallet_transaction_fee', 0),
            'withdrawal_fee_percentage' => self::getValue('withdrawal_fee_percentage', 0),
            'withdrawal_fee_fixed' => self::getValue('withdrawal_fee_fixed', 0),
            'daily_withdrawal_limit' => self::getValue('daily_withdrawal_limit', 50000),
        ];
    }

    public static function getSecuritySettings(): array
    {
        return [
            'require_kyc_verification' => self::getValue('require_kyc_verification', true),
            'require_email_verification' => self::getValue('require_email_verification', true),
            'require_phone_verification' => self::getValue('require_phone_verification', false),
            'max_login_attempts' => self::getValue('max_login_attempts', 5),
            'session_timeout_minutes' => self::getValue('session_timeout_minutes', 120),
            'password_min_length' => self::getValue('password_min_length', 8),
            'require_2fa' => self::getValue('require_2fa', false),
        ];
    }

    public static function getNotificationSettings(): array
    {
        return [
            'email_notifications_enabled' => self::getValue('email_notifications_enabled', true),
            'sms_notifications_enabled' => self::getValue('sms_notifications_enabled', false),
            'push_notifications_enabled' => self::getValue('push_notifications_enabled', true),
            'investment_notifications' => self::getValue('investment_notifications', true),
            'profit_notifications' => self::getValue('profit_notifications', true),
            'team_notifications' => self::getValue('team_notifications', true),
            'system_notifications' => self::getValue('system_notifications', true),
        ];
    }

    public static function getSystemSettings(): array
    {
        return [
            'system_maintenance_mode' => self::getValue('system_maintenance_mode', false),
            'allow_new_registrations' => self::getValue('allow_new_registrations', true),
            'allow_new_investments' => self::getValue('allow_new_investments', true),
            'allow_new_teams' => self::getValue('allow_new_teams', true),
            'system_timezone' => self::getValue('system_timezone', 'UTC'),
            'default_currency' => self::getValue('default_currency', 'INR'),
            'date_format' => self::getValue('date_format', 'Y-m-d'),
            'time_format' => self::getValue('time_format', 'H:i:s'),
        ];
    }

    public static function initializeDefaultSettings()
    {
        $defaultSettings = [
            // Investment Settings
            ['key' => 'minimum_investment', 'value' => '500', 'type' => 'currency', 'category' => 'investment', 'description' => 'Minimum investment amount required'],
            ['key' => 'maximum_investment', 'value' => '1000000', 'type' => 'currency', 'category' => 'investment', 'description' => 'Maximum investment amount allowed'],
            ['key' => 'investment_approval_required', 'value' => 'false', 'type' => 'boolean', 'category' => 'investment', 'description' => 'Require admin approval for investments'],
            ['key' => 'auto_approve_investments', 'value' => 'false', 'type' => 'boolean', 'category' => 'investment', 'description' => 'Automatically approve investments'],
            ['key' => 'investment_fee_percentage', 'value' => '0', 'type' => 'percentage', 'category' => 'investment', 'description' => 'Investment fee percentage'],
            ['key' => 'investment_fee_fixed', 'value' => '0', 'type' => 'currency', 'category' => 'investment', 'description' => 'Fixed investment fee amount'],

            // Profit Settings
            ['key' => 'company_profit_percentage', 'value' => '20', 'type' => 'percentage', 'category' => 'profit', 'description' => 'Company profit percentage'],
            ['key' => 'team_bonus_percentage', 'value' => '10', 'type' => 'percentage', 'category' => 'profit', 'description' => 'Team bonus percentage'],
            ['key' => 'minimum_profit_amount', 'value' => '0', 'type' => 'currency', 'category' => 'profit', 'description' => 'Minimum profit amount for distribution'],
            ['key' => 'profit_distribution_frequency', 'value' => 'monthly', 'type' => 'string', 'category' => 'profit', 'description' => 'Profit distribution frequency'],
            ['key' => 'auto_distribute_profits', 'value' => 'false', 'type' => 'boolean', 'category' => 'profit', 'description' => 'Automatically distribute profits'],

            // Team Settings
            ['key' => 'minimum_team_size', 'value' => '1', 'type' => 'integer', 'category' => 'team', 'description' => 'Minimum team size allowed'],
            ['key' => 'maximum_team_size', 'value' => '50', 'type' => 'integer', 'category' => 'team', 'description' => 'Maximum team size allowed'],
            ['key' => 'team_approval_required', 'value' => 'false', 'type' => 'boolean', 'category' => 'team', 'description' => 'Require admin approval for teams'],
            ['key' => 'team_leader_bonus_percentage', 'value' => '5', 'type' => 'percentage', 'category' => 'team', 'description' => 'Team leader bonus percentage'],
            ['key' => 'team_member_bonus_percentage', 'value' => '2', 'type' => 'percentage', 'category' => 'team', 'description' => 'Team member bonus percentage'],
            ['key' => 'team_minimum_investment', 'value' => '1000', 'type' => 'currency', 'category' => 'team', 'description' => 'Minimum investment for team members'],

            // Reinvestment Settings
            ['key' => 'auto_reinvestment_enabled', 'value' => 'false', 'type' => 'boolean', 'category' => 'reinvestment', 'description' => 'Enable auto reinvestment'],
            ['key' => 'auto_reinvestment_percentage', 'value' => '50', 'type' => 'percentage', 'category' => 'reinvestment', 'description' => 'Auto reinvestment percentage'],
            ['key' => 'minimum_reinvestment_amount', 'value' => '100', 'type' => 'currency', 'category' => 'reinvestment', 'description' => 'Minimum reinvestment amount'],
            ['key' => 'reinvestment_fee_percentage', 'value' => '0', 'type' => 'percentage', 'category' => 'reinvestment', 'description' => 'Reinvestment fee percentage'],
            ['key' => 'reinvestment_approval_required', 'value' => 'false', 'type' => 'boolean', 'category' => 'reinvestment', 'description' => 'Require approval for reinvestments'],

            // Wallet Settings
            ['key' => 'minimum_wallet_balance', 'value' => '0', 'type' => 'currency', 'category' => 'wallet', 'description' => 'Minimum wallet balance required'],
            ['key' => 'maximum_wallet_balance', 'value' => '10000000', 'type' => 'currency', 'category' => 'wallet', 'description' => 'Maximum wallet balance allowed'],
            ['key' => 'wallet_transaction_fee', 'value' => '0', 'type' => 'currency', 'category' => 'wallet', 'description' => 'Wallet transaction fee'],
            ['key' => 'withdrawal_fee_percentage', 'value' => '0', 'type' => 'percentage', 'category' => 'wallet', 'description' => 'Withdrawal fee percentage'],
            ['key' => 'withdrawal_fee_fixed', 'value' => '0', 'type' => 'currency', 'category' => 'wallet', 'description' => 'Fixed withdrawal fee'],
            ['key' => 'daily_withdrawal_limit', 'value' => '50000', 'type' => 'currency', 'category' => 'wallet', 'description' => 'Daily withdrawal limit'],

            // Security Settings
            ['key' => 'require_kyc_verification', 'value' => 'true', 'type' => 'boolean', 'category' => 'security', 'description' => 'Require KYC verification'],
            ['key' => 'require_email_verification', 'value' => 'true', 'type' => 'boolean', 'category' => 'security', 'description' => 'Require email verification'],
            ['key' => 'require_phone_verification', 'value' => 'false', 'type' => 'boolean', 'category' => 'security', 'description' => 'Require phone verification'],
            ['key' => 'max_login_attempts', 'value' => '5', 'type' => 'integer', 'category' => 'security', 'description' => 'Maximum login attempts allowed'],
            ['key' => 'session_timeout_minutes', 'value' => '120', 'type' => 'integer', 'category' => 'security', 'description' => 'Session timeout in minutes'],
            ['key' => 'password_min_length', 'value' => '8', 'type' => 'integer', 'category' => 'security', 'description' => 'Minimum password length'],
            ['key' => 'require_2fa', 'value' => 'false', 'type' => 'boolean', 'category' => 'security', 'description' => 'Require two-factor authentication'],

            // Notification Settings
            ['key' => 'email_notifications_enabled', 'value' => 'true', 'type' => 'boolean', 'category' => 'notification', 'description' => 'Enable email notifications'],
            ['key' => 'sms_notifications_enabled', 'value' => 'false', 'type' => 'boolean', 'category' => 'notification', 'description' => 'Enable SMS notifications'],
            ['key' => 'push_notifications_enabled', 'value' => 'true', 'type' => 'boolean', 'category' => 'notification', 'description' => 'Enable push notifications'],
            ['key' => 'investment_notifications', 'value' => 'true', 'type' => 'boolean', 'category' => 'notification', 'description' => 'Investment notifications'],
            ['key' => 'profit_notifications', 'value' => 'true', 'type' => 'boolean', 'category' => 'notification', 'description' => 'Profit notifications'],
            ['key' => 'team_notifications', 'value' => 'true', 'type' => 'boolean', 'category' => 'notification', 'description' => 'Team notifications'],
            ['key' => 'system_notifications', 'value' => 'true', 'type' => 'boolean', 'category' => 'notification', 'description' => 'System notifications'],

            // System Settings
            ['key' => 'system_maintenance_mode', 'value' => 'false', 'type' => 'boolean', 'category' => 'system', 'description' => 'System maintenance mode'],
            ['key' => 'allow_new_registrations', 'value' => 'true', 'type' => 'boolean', 'category' => 'system', 'description' => 'Allow new user registrations'],
            ['key' => 'allow_new_investments', 'value' => 'true', 'type' => 'boolean', 'category' => 'system', 'description' => 'Allow new investments'],
            ['key' => 'allow_new_teams', 'value' => 'true', 'type' => 'boolean', 'category' => 'system', 'description' => 'Allow new team creation'],
            ['key' => 'system_timezone', 'value' => 'UTC', 'type' => 'string', 'category' => 'system', 'description' => 'System timezone'],
            ['key' => 'default_currency', 'value' => 'INR', 'type' => 'string', 'category' => 'system', 'description' => 'Default currency'],
            ['key' => 'date_format', 'value' => 'Y-m-d', 'type' => 'string', 'category' => 'system', 'description' => 'Date format'],
            ['key' => 'time_format', 'value' => 'H:i:s', 'type' => 'string', 'category' => 'system', 'description' => 'Time format'],
        ];

        foreach ($defaultSettings as $setting) {
            self::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, [
                    'is_active' => true,
                    'created_by' => auth()->id() ?? 1,
                    'updated_by' => auth()->id() ?? 1,
                ])
            );
        }
    }

    public static function validateInvestmentAmount($amount): array
    {
        $settings = self::getInvestmentSettings();
        $errors = [];

        if ($amount < $settings['minimum_investment']) {
            $errors[] = "Minimum investment amount is ₹{$settings['minimum_investment']}";
        }

        if ($amount > $settings['maximum_investment']) {
            $errors[] = "Maximum investment amount is ₹{$settings['maximum_investment']}";
        }

        return $errors;
    }

    public static function validateTeamSize($size): array
    {
        $settings = self::getTeamSettings();
        $errors = [];

        if ($size < $settings['minimum_team_size']) {
            $errors[] = "Minimum team size is {$settings['minimum_team_size']}";
        }

        if ($size > $settings['maximum_team_size']) {
            $errors[] = "Maximum team size is {$settings['maximum_team_size']}";
        }

        return $errors;
    }

    public static function validateWalletBalance($balance): array
    {
        $settings = self::getWalletSettings();
        $errors = [];

        if ($balance < $settings['minimum_wallet_balance']) {
            $errors[] = "Minimum wallet balance is ₹{$settings['minimum_wallet_balance']}";
        }

        if ($balance > $settings['maximum_wallet_balance']) {
            $errors[] = "Maximum wallet balance is ₹{$settings['maximum_wallet_balance']}";
        }

        return $errors;
    }

    public static function calculateInvestmentFee($amount): float
    {
        $settings = self::getInvestmentSettings();
        $percentageFee = $amount * ($settings['investment_fee_percentage'] / 100);
        $fixedFee = $settings['investment_fee_fixed'];
        
        return $percentageFee + $fixedFee;
    }

    public static function calculateWithdrawalFee($amount): float
    {
        $settings = self::getWalletSettings();
        $percentageFee = $amount * ($settings['withdrawal_fee_percentage'] / 100);
        $fixedFee = $settings['withdrawal_fee_fixed'];
        
        return $percentageFee + $fixedFee;
    }

    public static function calculateReinvestmentFee($amount): float
    {
        $settings = self::getReinvestmentSettings();
        $percentageFee = $amount * ($settings['reinvestment_fee_percentage'] / 100);
        
        return $percentageFee;
    }
}
