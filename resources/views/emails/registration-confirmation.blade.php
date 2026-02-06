<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .highlight {
            background: #e3f2fd;
            padding: 20px;
            border-left: 4px solid #2196f3;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 30px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to Our Investment Platform!</h1>
        <p>Your registration is complete</p>
    </div>
    
    <div class="content">
        <p>Dear {{ $user->name }},</p>
        
        <p>Thank you for registering with our investment platform. Your account has been successfully created with the following details:</p>
        
        <div class="highlight">
            <h3>Account Details:</h3>
            <p><strong>Name:</strong> {{ $user->name }}</p>
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Phone:</strong> {{ $user->phone }}</p>
            <p><strong>Referral Code:</strong> {{ $referralCode }}</p>
            <p><strong>Status:</strong> Inactive (Pending Registration Fee)</p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
            <li>Pay the one-time registration fee of {{ $registrationFee }}</li>
            <li>Complete your profile with additional information</li>
            <li>Upload KYC documents for verification</li>
            <li>Start investing once your account is activated</li>
        </ol>
        
        <p><strong>Registration Fee Payment:</strong></p>
        <p>To activate your account, please pay the registration fee of {{ $registrationFee }}. You can pay using:</p>
        <ul>
            <li>UPI (PhonePe, Google Pay, Paytm)</li>
            <li>Net Banking</li>
            <li>Debit/Credit Cards</li>
            <li>Digital Wallets</li>
        </ul>
        
        <p>Once the registration fee is paid, your account will be activated and you can start using all features of our platform.</p>
        
        <div class="highlight">
            <p><strong>Important:</strong> Your referral code <strong>{{ $referralCode }}</strong> can be shared with friends and family to earn referral bonuses!</p>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Thank you for choosing our investment platform!</p>
        
        <p>Best regards,<br>
        The Investment Platform Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} Investment Platform. All rights reserved.</p>
    </div>
</body>
</html>
