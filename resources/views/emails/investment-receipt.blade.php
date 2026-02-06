<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Investment Receipt</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .info-section h3 {
            color: #4b5563;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
        }
        .info-label {
            color: #6b7280;
            font-weight: 500;
        }
        .info-value {
            color: #111827;
            font-weight: 600;
        }
        .investment-details {
            background: #f9fafb;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #10b981;
        }
        .investment-details h3 {
            color: #111827;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 18px;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .detail-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .detail-item .label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .detail-item .value {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
        }
        .plot-allocations {
            margin-top: 30px;
        }
        .plot-allocations h3 {
            color: #111827;
            margin-bottom: 20px;
            font-size: 18px;
        }
        .plot-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .plot-table th,
        .plot-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .plot-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #4b5563;
            font-size: 14px;
        }
        .plot-table tr:hover {
            background-color: #f9fafb;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-active {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-completed {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .amount {
            color: #059669;
            font-weight: 700;
        }
        .highlight-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .highlight-box h4 {
            color: #0c4a6e;
            margin-top: 0;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Investment Receipt</h1>
        <p>Thank you for your investment! Here are your investment details.</p>
    </div>

    <div class="content">
        <div class="receipt-info">
            <div class="info-section">
                <h3>Investment Information</h3>
                <div class="info-item">
                    <span class="info-label">Investment ID:</span>
                    <span class="info-value">{{ $investment->investment_id }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Investment Type:</span>
                    <span class="info-value">{{ ucfirst($investment->investment_type) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="status-badge status-{{ $investment->status }}">
                            {{ ucfirst($investment->status) }}
                        </span>
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Investment Date:</span>
                    <span class="info-value">{{ $investment->investment_date->format('M d, Y') }}</span>
                </div>
                @if($investment->approval_date)
                <div class="info-item">
                    <span class="info-label">Approval Date:</span>
                    <span class="info-value">{{ $investment->approval_date->format('M d, Y') }}</span>
                </div>
                @endif
            </div>

            <div class="info-section">
                <h3>Investor Information</h3>
                <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">{{ $user->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $user->email }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">{{ $user->phone ?? 'N/A' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">User ID:</span>
                    <span class="info-value">#{{ str_pad($user->id, 6, '0', STR_PAD_LEFT) }}</span>
                </div>
            </div>
        </div>

        <div class="investment-details">
            <h3>Investment Summary</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="label">Investment Amount</div>
                    <div class="value amount">₹{{ number_format($investment->amount, 2) }}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Expected Return</div>
                    <div class="value">₹{{ number_format($investment->expected_return, 2) }}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Return Rate</div>
                    <div class="value">{{ $investment->return_rate }}%</div>
                </div>
                <div class="detail-item">
                    <div class="label">Maturity Date</div>
                    <div class="value">{{ $investment->maturity_date->format('M d, Y') }}</div>
                </div>
            </div>
        </div>

        @if($property)
        <div class="info-section">
            <h3>Project Details</h3>
            <div class="info-item">
                <span class="info-label">Project Name:</span>
                <span class="info-value">{{ $property->name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Project Type:</span>
                <span class="info-value">{{ ucfirst($property->type) }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Location:</span>
                <span class="info-value">{{ $property->location }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Expected ROI:</span>
                <span class="info-value">{{ $property->expected_roi }}%</span>
            </div>
        </div>
        @endif

        @if($plot)
        <div class="info-section">
            <h3>Plot Details</h3>
            <div class="info-item">
                <span class="info-label">Plot Number:</span>
                <span class="info-value">{{ $plot->plot_number }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Area:</span>
                <span class="info-value">{{ $plot->area }} {{ $plot->area_unit }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Price:</span>
                <span class="info-value">₹{{ number_format($plot->price, 2) }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Plot Type:</span>
                <span class="info-value">{{ ucfirst($plot->plot_type) }}</span>
            </div>
        </div>
        @endif

        @if($plotHoldings && $plotHoldings->count() > 0)
        <div class="plot-allocations">
            <h3>Plot Allocations</h3>
            <table class="plot-table">
                <thead>
                    <tr>
                        <th>Plot Number</th>
                        <th>Area</th>
                        <th>Amount Invested</th>
                        <th>Ownership %</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($plotHoldings as $holding)
                    <tr>
                        <td>{{ $holding->plot->plot_number }}</td>
                        <td>{{ $holding->plot->area }} {{ $holding->plot->area_unit }}</td>
                        <td class="amount">₹{{ number_format($holding->amount_invested, 2) }}</td>
                        <td>{{ number_format($holding->percentage_owned, 2) }}%</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        @if($investment->auto_reinvest)
        <div class="highlight-box">
            <h4>Auto-Reinvestment Enabled</h4>
            <p>Your investment is set up for automatic reinvestment of returns. 
               {{ $investment->reinvest_percentage ?? 100 }}% of your returns will be automatically reinvested 
               when this investment matures.</p>
        </div>
        @endif

        @if($investment->notes)
        <div class="info-section">
            <h3>Additional Notes</h3>
            <p>{{ $investment->notes }}</p>
        </div>
        @endif

        <div class="footer">
            <p>This receipt serves as confirmation of your investment. Please keep it for your records.</p>
            <p>For any questions or concerns, please contact our support team.</p>
            <p><strong>Generated on:</strong> {{ now()->format('M d, Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
