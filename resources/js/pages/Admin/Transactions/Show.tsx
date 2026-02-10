import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    ArrowLeft,
    DollarSign,
    User,
    Wallet,
    Calendar,
    CreditCard,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    Trash2,
    Shield,
    Download,
    RefreshCw,
    Eye
} from 'lucide-react';

interface TransactionData {
    id: number;
    user_id: number;
    wallet_id: number;
    type: string;
    amount: number;
    status: string;
    description: string;
    payment_method_id?: number;
    reference_id?: string;
    metadata?: any;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        wallet?: {
            id: number;
            balance: number;
        };
    };
    wallet?: {
        id: number;
        balance: number;
    };
    payment_method?: {
        id: number;
        name: string;
        type: string;
    };
    approved_by?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

interface AdminTransactionShowProps {
    transaction: TransactionData;
}

export default function AdminTransactionShow({ transaction }: AdminTransactionShowProps) {
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

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case 'deposit':
                return 'text-green-600';
            case 'withdrawal':
                return 'text-red-600';
            case 'investment':
                return 'text-purple-600';
            case 'profit':
                return 'text-blue-600';
            case 'refund':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const getTransactionTypeIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return <TrendingUp className="h-5 w-5" />;
            case 'withdrawal':
                return <TrendingDown className="h-5 w-5" />;
            case 'investment':
                return <DollarSign className="h-5 w-5" />;
            case 'profit':
                return <TrendingUp className="h-5 w-5" />;
            case 'refund':
                return <RefreshCw className="h-5 w-5" />;
            default:
                return <DollarSign className="h-5 w-5" />;
        }
    };

    return (
        <AdminLayout>
            <Head title={`Transaction Details - ${transaction.user.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/admin/transactions"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Transactions
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
                            <p className="text-gray-600 mt-1">View transaction information and history</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/transactions/${transaction.id}/edit`}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Transaction
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete this transaction? This action cannot be undone and will affect the user's wallet balance.`)) {
                                    router.delete(`/admin/transactions/${transaction.id}`);
                                }
                            }}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Transaction
                        </button>
                    </div>
                </div>

                {/* Transaction Overview */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    {getTransactionTypeIcon(transaction.type)}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1)} Transaction
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {transaction.user.name} - {transaction.user.email}
                                    </p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className={`h-5 w-5 mr-2 ${getTransactionTypeColor(transaction.type)}`}>
                                        {getTransactionTypeIcon(transaction.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <User className="h-5 w-5 text-blue-600 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">User</p>
                                        <p className="text-lg font-bold text-gray-900">{transaction.user.name}</p>
                                        <p className="text-sm text-gray-500">{transaction.user.email}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {new Date(transaction.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Transaction ID</p>
                                <p className="text-lg font-semibold text-gray-900">#{transaction.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Reference ID</p>
                                <p className="text-lg font-semibold text-gray-900">{transaction.reference_id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {transaction.payment_method?.name || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {transaction.description || 'No description provided'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                                        {transaction.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Created By</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {transaction.approved_by?.name || 'System'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created At</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {new Date(transaction.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Last Updated</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {new Date(transaction.updated_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Wallet ID</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    #{transaction.wallet_id || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User and Wallet Info */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">User & Wallet Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <User className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{transaction.user.name}</p>
                                            <p className="text-sm text-gray-500">{transaction.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Shield className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{transaction.user.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Details</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Wallet ID: #{transaction.wallet?.id || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">
                                                Balance: {transaction.wallet ? formatCurrency(transaction.wallet.balance) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/admin/transactions/${transaction.id}/edit`}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Transaction
                            </Link>
                            <button
                                onClick={() => {
                                    if (confirm(`Are you sure you want to delete this transaction? This action cannot be undone and will affect the user's wallet balance.`)) {
                                        router.delete(`/admin/transactions/${transaction.id}`);
                                    }
                                }}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Transaction
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                Export Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
