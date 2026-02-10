import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Plus,
    Save,
    User,
    Wallet,
    CreditCard,
    DollarSign,
    Calendar,
    Shield,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface TransactionData {
    user_id: number;
    wallet_id: number;
    type: string;
    amount: number;
    status: string;
    description: string;
    payment_method_id?: number;
    reference_id?: string;
    metadata?: any;
}

interface AdminTransactionCreateProps {
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

export default function AdminTransactionCreate({ users, paymentMethods }: AdminTransactionCreateProps) {
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [availableWallets, setAvailableWallets] = useState<Array<{id: number; balance: number}>>([]);

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        wallet_id: '',
        type: 'deposit',
        amount: '',
        status: 'pending',
        description: '',
        payment_method_id: '',
        reference_id: '',
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
        post('/admin/transactions/store', {
            onSuccess: () => {
                router.visit('/admin/transactions');
            },
            onError: (errors) => {
                console.error('Create failed:', errors);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Transaction" />
            
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
                            <h1 className="text-3xl font-bold text-gray-900">Create Transaction</h1>
                            <p className="text-gray-600 mt-1">Create a new transaction for a user</p>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Transaction Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

                        {/* User Info Preview */}
                        {selectedUser && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <User className="h-6 w-6 text-blue-600 mt-1" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Selected User</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            {(() => {
                                                const user = users.find(u => u.id === selectedUser);
                                                return user ? (
                                                    <div>
                                                        <p><strong>Name:</strong> {user.name}</p>
                                                        <p><strong>Email:</strong> {user.email}</p>
                                                        <p><strong>Role:</strong> {user.role}</p>
                                                        <p><strong>Wallet Balance:</strong> {user.wallet ? formatCurrency(user.wallet.balance) : 'No wallet'}</p>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Link
                                href="/admin/transactions"
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Creating...' : 'Create Transaction'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Shield className="h-6 w-6 text-blue-600 mt-1" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Transaction Creation Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Select the user who will receive this transaction</li>
                                    <li>Choose the appropriate transaction type (deposit, withdrawal, investment, etc.)</li>
                                    <li>Enter the exact amount for the transaction</li>
                                    <li>Set the initial status (pending, completed, or failed)</li>
                                    <li>Provide a clear description for record-keeping</li>
                                    <li>Reference ID helps track related transactions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
