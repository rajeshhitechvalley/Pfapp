import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Save,
    User,
    Wallet,
    CreditCard,
    DollarSign,
    Calendar,
    Shield,
    X,
    CheckCircle,
    AlertTriangle
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
    created_at: string;
    updated_at: string;
}

interface AdminTransactionEditProps {
    transaction: TransactionData;
    users: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        wallet?: {
            id: number;
            balance: number;
        };
    }>;
    paymentMethods: Array<{
        id: number;
        name: string;
        type: string;
        status: string;
    }>;
}

export default function AdminTransactionEdit({ transaction, users, paymentMethods }: AdminTransactionEditProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<number | null>(transaction.user_id);
    const [availableWallets, setAvailableWallets] = useState<Array<{id: number; balance: number}>>([]);

    const { data, setData, put, processing, errors } = useForm({
        user_id: transaction.user_id.toString(),
        wallet_id: transaction.wallet_id?.toString() || '',
        type: transaction.type,
        amount: transaction.amount.toString(),
        status: transaction.status,
        description: transaction.description || '',
        payment_method_id: transaction.payment_method_id?.toString() || '',
        reference_id: transaction.reference_id || '',
    });

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

    // Update available wallets when user changes
    React.useEffect(() => {
        if (selectedUser) {
            const user = users.find(u => u.id === selectedUser);
            if (user?.wallet) {
                setAvailableWallets([user.wallet]);
            } else {
                setAvailableWallets([]);
            }
            setData('wallet_id', user?.wallet?.id?.toString() || '');
        } else {
            setAvailableWallets([]);
            setData('wallet_id', '');
        }
    }, [selectedUser, users]);

    const handleUserChange = (userId: string) => {
        const uid = parseInt(userId);
        setSelectedUser(uid);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/transactions/${transaction.id}/update`, {
            onSuccess: () => {
                router.visit(`/admin/transactions/${transaction.id}`);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const handleDeleteTransaction = () => {
        router.delete(`/admin/transactions/${transaction.id}`, {
            onSuccess: () => {
                router.visit('/admin/transactions');
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                setShowDeleteModal(false);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit Transaction - ${transaction.user.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={`/admin/transactions/${transaction.id}`}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Transaction
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Transaction</h1>
                            <p className="text-gray-600 mt-1">Update transaction information and status</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/transactions/${transaction.id}`}
                            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            View Transaction
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Delete Transaction
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Transaction Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* User Info Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <User className="h-6 w-6 text-blue-600 mt-1" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Transaction Owner</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p><strong>Name:</strong> {transaction.user?.name || 'Unknown'}</p>
                                        <p><strong>Email:</strong> {transaction.user?.email || 'Unknown'}</p>
                                        <p><strong>Role:</strong> {transaction.user?.role || 'Unknown'}</p>
                                        <p><strong>Transaction ID:</strong> #{transaction.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select User
                                </label>
                                <select
                                    id="user_id"
                                    value={data.user_id}
                                    onChange={(e) => {
                                        setData('user_id', e.target.value);
                                        handleUserChange(e.target.value);
                                    }}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select User</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email}) - {user.role}
                                            {user.wallet && ` - Wallet: ${formatCurrency(user.wallet.balance)}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="wallet_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Wallet
                                </label>
                                <select
                                    id="wallet_id"
                                    value={data.wallet_id}
                                    onChange={(e) => setData('wallet_id', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={!selectedUser}
                                >
                                    <option value="">Select Wallet</option>
                                    {availableWallets.map((wallet) => (
                                        <option key={wallet.id} value={wallet.id}>
                                            Wallet #{wallet.id} - {formatCurrency(wallet.balance)}
                                        </option>
                                    ))}
                                </select>
                                {errors.wallet_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.wallet_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Type
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="deposit">Deposit</option>
                                    <option value="withdrawal">Withdrawal</option>
                                    <option value="investment">Investment</option>
                                    <option value="profit">Profit</option>
                                    <option value="refund">Refund</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="payment_method_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <select
                                    id="payment_method_id"
                                    value={data.payment_method_id}
                                    onChange={(e) => setData('payment_method_id', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Payment Method</option>
                                    {paymentMethods.map((method) => (
                                        <option key={method.id} value={method.id}>
                                            {method.name} ({method.type})
                                        </option>
                                    ))}
                                </select>
                                {errors.payment_method_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.payment_method_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="reference_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reference ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="reference_id"
                                    value={data.reference_id}
                                    onChange={(e) => setData('reference_id', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter reference ID"
                                />
                                {errors.reference_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reference_id}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter transaction description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Current Transaction Info */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-800 mb-3">Current Transaction Information</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Created</p>
                                    <p className="font-medium text-gray-900">{new Date(transaction.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Last Updated</p>
                                    <p className="font-medium text-gray-900">{new Date(transaction.updated_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Original Amount</p>
                                    <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Type</p>
                                    <p className="font-medium text-gray-900">{transaction.type?.toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Link
                                href={`/admin/transactions/${transaction.id}`}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-blue-600 mt-1" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Transaction Editing Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Be careful when changing transaction amounts as it affects user balances</li>
                                    <li>Status changes should be made with proper verification</li>
                    <li>Payment method changes should be documented properly</li>
                                    <li>Reference IDs help track related transactions and disputes</li>
                                    <li>Always provide clear descriptions for audit trails</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Transaction</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Are you sure you want to delete this transaction? This action cannot be undone and will affect the user's wallet balance.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteTransaction}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
