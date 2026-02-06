<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
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
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
        .otp-box {
            background: #fff;
            border: 2px dashed #ff6b6b;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 10px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #ff6b6b;
            letter-spacing: 8px;
            margin: 10px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #856404;
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
        <h1>Password Reset Request</h1>
        <p>Your OTP is ready</p>
    </div>
    
    <div class="content">
        <p>Hello,</p>
        
        <p>We received a request to reset your password for your investment platform account. Use the OTP below to proceed with the password reset:</p>
        
        <div class="otp-box">
            <h3>Your One-Time Password (OTP)</h3>
            <div class="otp-code">{{ $otp }}</div>
            <p><small>This OTP is valid for {{ $expiryMinutes }} minutes only</small></p>
        </div>
        
        <div class="warning">
            <p><strong>Security Notice:</strong></p>
            <ul>
                <li>Never share this OTP with anyone</li>
                <li>We will never ask for your OTP via phone or email</li>
                <li>If you didn't request this password reset, please ignore this email</li>
            </ul>
        </div>
        
        <h3>Steps to Reset Your Password:</h3>
        <ol>
            <li>Go to the password reset page</li>
            <li>Enter this OTP: <strong>{{ $otp }}</strong></li>
            <li>Create your new password</li>
            <li>Confirm your new password</li>
            <li>Submit the form</li>
        </ol>
        
        <p><strong>Important:</strong></p>
        <ul>
            <li>This OTP will expire in {{ $expiryMinutes }} minutes</li>
            <li>After expiration, you'll need to request a new OTP</li>
            <li>Make sure your new password is strong and unique</li>
        </ul>
        
        <p>If you continue to have issues, please contact our support team for assistance.</p>
        
        <p>Best regards,<br>
        The Investment Platform Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} Investment Platform. All rights reserved.</p>
    </div>
</body>
</html>
