import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    ArrowLeft,
    Wallet,
    DollarSign,
    User,
    Calendar,
    TrendingUp,
    TrendingDown,
    Eye,
    Edit,
    Trash2,
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    Download,
    RefreshCw
} from 'lucide-react';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    status: string;
    description: string;
    payment_method?: {
        name: string;
    };
    created_at: string;
}

interface WalletData {
    id: number;
    balance: number;
    total_deposits: number;
    total_withdrawals: number;
    total_investments: number;
    frozen_amount: number;
    pending_amount: number;
    status: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    transactions: Transaction[];
    created_at: string;
    updated_at: string;
}

interface AdminWalletShowProps {
    wallet: WalletData;
}

export default function AdminWalletShow({ wallet }: AdminWalletShowProps) {
    // Helper function to format currency
    const formatCurrency = (amount: number | string | null | undefined): string => {
        if (amount === null || amount === undefined || amount === '') {
            return '₹0.00';
        }
        
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (isNaN(numAmount)) {
            return '₹0.00';
        }
        
        return `₹${numAmount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'frozen':
                return 'bg-blue-100 text-blue-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case 'deposit':
                return 'text-green-600';
            case 'withdrawal':
                return 'text-red-600';
            case 'investment':
                return 'text-purple-600';
            default:
                return 'text-gray-600';
        }
    };

    const getTransactionStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title={`Wallet Details - ${wallet.user.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/admin/wallets"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Wallets
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Wallet Details</h1>
                            <p className="text-gray-600 mt-1">View wallet information and transaction history</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/wallets/${wallet.id}/edit`}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Wallet
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete ${wallet.user.name}'s wallet? This action cannot be undone.`)) {
                                    router.delete(`/admin/wallets/${wallet.id}`);
                                }
                            }}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Wallet
                        </button>
                    </div>
                </div>

                {/* Wallet Overview */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Wallet className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-gray-900">{wallet.user.name}'s Wallet</h2>
                                    <p className="text-sm text-gray-500">{wallet.user.email}</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(wallet.status)}`}>
                                {wallet.status?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Current Balance</p>
                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(wallet.balance)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total Deposits</p>
                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(wallet.total_deposits)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total Withdrawals</p>
                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(wallet.total_withdrawals)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total Investments</p>
                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(wallet.total_investments)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Frozen Amount</p>
                                <p className="text-lg font-semibold text-blue-600">{formatCurrency(wallet.frozen_amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending Amount</p>
                                <p className="text-lg font-semibold text-yellow-600">{formatCurrency(wallet.pending_amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available Balance</p>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(wallet.balance - wallet.frozen_amount - wallet.pending_amount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                            <div className="flex items-center space-x-3">
                                <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </button>
                                <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {wallet.transactions?.length > 0 ? (
                                    wallet.transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    {new Date(transaction.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                                    {transaction.type?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.description || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                                    {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.payment_method?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                                    {transaction.status?.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <Eye className="h-12 w-12 text-gray-300 mb-3" />
                                                <p>No transactions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Wallet Info */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Wallet Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Wallet ID</p>
                                <p className="text-lg font-medium text-gray-900">#{wallet.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">User</p>
                                <p className="text-lg font-medium text-gray-900">{wallet.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-lg font-medium text-gray-900">{wallet.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <p className="text-lg font-medium text-gray-900">{wallet.user.role}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="text-lg font-medium text-gray-900">{new Date(wallet.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Last Updated</p>
                                <p className="text-lg font-medium text-gray-900">{new Date(wallet.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
