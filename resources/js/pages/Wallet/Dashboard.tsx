import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { 
    Wallet, 
    ArrowDown, 
    ArrowUp, 
    TrendingUp, 
    CreditCard, 
    Smartphone, 
    Building, 
    Download,
    Calendar,
    Filter,
    Search,
    Eye,
    RefreshCw,
    Settings,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    BarChart3,
    PieChart,
    FileText,
    Mail,
    Bell,
    X
} from 'lucide-react';

interface WalletData {
    id: number;
    wallet_id: string;
    balance: number;
    total_deposits: number;
    total_withdrawals: number;
    total_investments: number;
    total_profits: number;
    status: string;
    frozen_amount: number;
    pending_amount: number;
    last_transaction_at: string;
    created_at: string;
}

interface Transaction {
    id: number;
    transaction_id: string;
    type: string;
    amount: number;
    processing_fee: number;
    net_amount: number;
    balance_before: number;
    balance_after: number;
    reference: string;
    description: string;
    status: string;
    payment_mode: string;
    payment_reference: string;
    created_at: string;
    approved_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
}

interface WalletSummary {
    total_transactions: number;
    pending_transactions: number;
    completed_transactions: number;
    total_deposits: number;
    total_withdrawals: number;
    total_investments: number;
    total_profits: number;
    current_balance: number;
    available_balance: number;
    frozen_amount: number;
    pending_amount: number;
}

interface PaymentMethod {
    id: number;
    name: string;
    code: string;
    type: string;
    is_active: boolean;
    min_amount: number;
    max_amount: number;
    processing_fee: number;
    processing_fee_type: string;
}

export default function WalletDashboard() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<WalletSummary | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showAutoDepositModal, setShowAutoDepositModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics' | 'settings'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { data: depositData, setData: setDepositData, post: postDeposit, processing: depositProcessing } = useForm({
        amount: '',
        payment_method_id: '',
        payment_mode: '',
        payment_reference: '',
        notes: '',
        auto_approve: false,
    });

    const { data: withdrawData, setData: setWithdrawData, post: postWithdraw, processing: withdrawProcessing } = useForm({
        amount: '',
        payment_method_id: '',
        payment_mode: '',
        bank_account: '',
        upi_id: '',
        notes: '',
    });

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/wallet/summary');
            const data = await response.json();
            
            if (data.success) {
                setWallet(data.data.wallet);
                setTransactions(data.data.recent_transactions || []);
                setSummary(data.data.summary);
                setPaymentMethods(data.data.payment_methods || []);
            }
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await fetchWalletData();
        setRefreshing(false);
    };

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        postDeposit('/api/wallet/deposit', {
            onSuccess: () => {
                setShowDepositModal(false);
                setDepositData('amount', '');
                setDepositData('payment_method_id', '');
                setDepositData('payment_mode', '');
                setDepositData('payment_reference', '');
                setDepositData('notes', '');
                setDepositData('auto_approve', false);
                fetchWalletData();
            },
            onError: (errors: any) => {
                console.error('Deposit failed:', errors);
            }
        });
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdraw('/api/wallet/withdraw', {
            onSuccess: () => {
                setShowWithdrawModal(false);
                setWithdrawData('amount', '');
                setWithdrawData('payment_method_id', '');
                setWithdrawData('payment_mode', '');
                setWithdrawData('bank_account', '');
                setWithdrawData('upi_id', '');
                setWithdrawData('notes', '');
                fetchWalletData();
            },
            onError: (errors: any) => {
                console.error('Withdrawal failed:', errors);
            }
        });
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || transaction.type === filterType;
        const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'rejected': return 'text-red-600';
            case 'failed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'rejected': return <XCircle className="h-4 w-4" />;
            case 'failed': return <AlertTriangle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'deposit': return <ArrowDown className="h-4 w-4" />;
            case 'withdrawal': return <ArrowUp className="h-4 w-4" />;
            case 'investment': return <TrendingUp className="h-4 w-4" />;
            case 'profit': return <TrendingUp className="h-4 w-4" />;
            default: return <Wallet className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'deposit': return 'text-green-600';
            case 'withdrawal': return 'text-red-600';
            case 'investment': return 'text-blue-600';
            case 'profit': return 'text-purple-600';
            default: return 'text-gray-600';
        }
    };

    const getPaymentModeIcon = (mode: string) => {
        switch (mode) {
            case 'upi': return <Smartphone className="h-4 w-4" />;
            case 'card': return <CreditCard className="h-4 w-4" />;
            case 'net_banking': return <Building className="h-4 w-4" />;
            default: return <Wallet className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <Head title="Wallet Dashboard" />
                <div className="max-w-4xl mx-auto p-6">
                    <div className="text-center py-12">
                        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading wallet data...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Wallet Dashboard" />
            
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Wallet Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage your finances and transactions</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" onClick={refreshData} disabled={refreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button onClick={() => setShowDepositModal(true)}>
                            <ArrowDown className="h-4 w-4 mr-2" />
                            Deposit
                        </Button>
                        <Button variant="outline" onClick={() => setShowWithdrawModal(true)}>
                            <ArrowUp className="h-4 w-4 mr-2" />
                            Withdraw
                        </Button>
                    </div>
                </div>

                {/* Wallet Balance Card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Available Balance</p>
                            <p className="text-3xl font-bold mt-1">₹{summary?.available_balance?.toLocaleString() || '0'}</p>
                            <p className="text-blue-100 text-sm mt-2">Wallet ID: {wallet?.wallet_id}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    wallet?.status === 'active' ? 'bg-green-100 text-green-800' :
                                    wallet?.status === 'frozen' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {wallet?.status?.toUpperCase() || 'UNKNOWN'}
                                </span>
                            </div>
                            <p className="text-blue-100 text-xs mt-2">
                                Last transaction: {wallet?.last_transaction_at ? 
                                    new Date(wallet.last_transaction_at).toLocaleDateString() : 
                                    'No transactions'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                                <p className="text-2xl font-bold text-gray-900">₹{(summary?.total_deposits || 0).toLocaleString()}</p>
                            </div>
                            <ArrowDown className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                                <p className="text-2xl font-bold text-gray-900">₹{(summary?.total_withdrawals || 0).toLocaleString()}</p>
                            </div>
                            <ArrowUp className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Investments</p>
                                <p className="text-2xl font-bold text-gray-900">₹{(summary?.total_investments || 0).toLocaleString()}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Profits</p>
                                <p className="text-2xl font-bold text-gray-900">₹{(summary?.total_profits || 0).toLocaleString()}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'transactions'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Transactions
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'analytics'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'settings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Settings
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setShowDepositModal(true)}
                                                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                <ArrowDown className="h-4 w-4 mr-2" />
                                                Quick Deposit
                                            </button>
                                            <button
                                                onClick={() => setShowWithdrawModal(true)}
                                                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                            >
                                                <ArrowUp className="h-4 w-4 mr-2" />
                                                Quick Withdraw
                                            </button>
                                            <button
                                                onClick={() => setShowAutoDepositModal(true)}
                                                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Auto Deposit
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                                        <div className="space-y-3">
                                            {transactions.slice(0, 5).map(transaction => (
                                                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-full ${getTypeColor(transaction.type)} bg-opacity-10`}>
                                                            {getTypeIcon(transaction.type)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                                                            <p className="text-xs text-gray-500">{transaction.reference}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">₹{transaction.amount.toLocaleString()}</p>
                                                        <div className="flex items-center space-x-1">
                                                            {getStatusIcon(transaction.status)}
                                                            <span className={`text-xs ${getStatusColor(transaction.status)}`}>
                                                                {transaction.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search transactions..."
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="all">All Types</option>
                                            <option value="deposit">Deposits</option>
                                            <option value="withdrawal">Withdrawals</option>
                                            <option value="investment">Investments</option>
                                            <option value="profit">Profits</option>
                                        </select>
                                        <select
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="completed">Completed</option>
                                            <option value="pending">Pending</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                    <Button variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTransactions.map(transaction => (
                                                <tr key={transaction.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(transaction.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className={`p-1 rounded-full ${getTypeColor(transaction.type)} bg-opacity-10`}>
                                                                {getTypeIcon(transaction.type)}
                                                            </div>
                                                            <span className={`ml-2 text-sm font-medium ${getTypeColor(transaction.type)}`}>
                                                                {transaction.type}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            <p className="font-medium">{transaction.description}</p>
                                                            <p className="text-xs text-gray-500">{transaction.reference}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        ₹{transaction.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {getStatusIcon(transaction.status)}
                                                            <span className={`ml-2 text-sm ${getStatusColor(transaction.status)}`}>
                                                                {transaction.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Trends</h3>
                                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Distribution</h3>
                                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <PieChart className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                                <p className="text-sm text-gray-500">Enable 2FA for high-value transactions</p>
                                            </div>
                                            <Button variant="outline">
                                                <Shield className="h-4 w-4 mr-2" />
                                                Configure
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Payment Methods</p>
                                                <p className="text-sm text-gray-500">Manage your payment options</p>
                                            </div>
                                            <Button variant="outline">
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Manage
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Transaction Limits</p>
                                                <p className="text-sm text-gray-500">Set daily and monthly limits</p>
                                            </div>
                                            <Button variant="outline">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Configure
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Deposit Funds</h3>
                            <button
                                onClick={() => setShowDepositModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleDeposit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    min="500"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter amount (minimum ₹500)"
                                    value={depositData.amount}
                                    onChange={(e) => setDepositData('amount', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={depositData.payment_method_id}
                                    onChange={(e) => setDepositData('payment_method_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select payment method</option>
                                    {paymentMethods.map(method => (
                                        <option key={method.id} value={method.id}>
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={depositData.payment_mode}
                                    onChange={(e) => setDepositData('payment_mode', e.target.value)}
                                    required
                                >
                                    <option value="">Select payment mode</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                    <option value="net_banking">Net Banking</option>
                                    <option value="wallet">Wallet</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reference (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Transaction reference"
                                    value={depositData.payment_reference}
                                    onChange={(e) => setDepositData('payment_reference', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add notes about this transaction"
                                    value={depositData.notes}
                                    onChange={(e) => setDepositData('notes', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="auto_approve"
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                    checked={depositData.auto_approve}
                                    onChange={(e) => setDepositData('auto_approve', e.target.checked)}
                                />
                                <label htmlFor="auto_approve" className="ml-2 text-sm text-gray-600">
                                    Auto-approve (amounts below ₹10,000)
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDepositModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" disabled={depositProcessing}>
                                    {depositProcessing ? 'Processing...' : 'Deposit'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    min="1000"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter amount (minimum ₹1,000)"
                                    value={withdrawData.amount}
                                    onChange={(e) => setWithdrawData('amount', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={withdrawData.payment_method_id}
                                    onChange={(e) => setWithdrawData('payment_method_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select payment method</option>
                                    {paymentMethods.map(method => (
                                        <option key={method.id} value={method.id}>
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={withdrawData.payment_mode}
                                    onChange={(e) => setWithdrawData('payment_mode', e.target.value)}
                                    required
                                >
                                    <option value="">Select payment mode</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="upi">UPI</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter bank account number"
                                    value={withdrawData.bank_account}
                                    onChange={(e) => setWithdrawData('bank_account', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter UPI ID"
                                    value={withdrawData.upi_id}
                                    onChange={(e) => setWithdrawData('upi_id', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add notes about this transaction"
                                    value={withdrawData.notes}
                                    onChange={(e) => setWithdrawData('notes', e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" disabled={withdrawProcessing}>
                                    {withdrawProcessing ? 'Processing...' : 'Withdraw'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
