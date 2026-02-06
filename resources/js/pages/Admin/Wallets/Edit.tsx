import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Wallet,
    Save,
    User,
    DollarSign,
    Shield,
    AlertTriangle,
    CheckCircle,
    X
} from 'lucide-react';

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
    created_at: string;
    updated_at: string;
}

interface AdminWalletEditProps {
    wallet: WalletData;
}

export default function AdminWalletEdit({ wallet }: AdminWalletEditProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Guard clause in case wallet is not loaded yet
    if (!wallet) {
        return (
            <AdminLayout>
                <Head title="Edit Wallet" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-gray-500">Loading wallet data...</div>
                </div>
            </AdminLayout>
        );
    }

    const { data, setData, put, processing, errors } = useForm({
        balance: (wallet?.balance || 0).toString(),
        frozen_amount: (wallet?.frozen_amount || 0).toString(),
        pending_amount: (wallet?.pending_amount || 0).toString(),
        status: wallet?.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/wallets/${wallet?.id}/update`, {
            onSuccess: () => {
                router.visit(`/admin/wallets/${wallet?.id}`);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const handleDeleteWallet = () => {
        router.delete(`/admin/wallets/${wallet?.id}`, {
            onSuccess: () => {
                router.visit('/admin/wallets');
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                setShowDeleteModal(false);
            }
        });
    };

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

    return (
        <AdminLayout>
            <Head title={`Edit Wallet - ${wallet?.user?.name || 'Unknown'}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={`/admin/wallets/${wallet?.id}`}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Wallet
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Wallet</h1>
                            <p className="text-gray-600 mt-1">Update wallet information and settings</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/wallets/${wallet?.id}`}
                            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            View Wallet
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Delete Wallet
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Wallet Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* User Info Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <User className="h-6 w-6 text-blue-600 mt-1" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Wallet Owner</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p><strong>Name:</strong> {wallet?.user?.name || 'Unknown'}</p>
                                        <p><strong>Email:</strong> {wallet?.user?.email || 'Unknown'}</p>
                                        <p><strong>Role:</strong> {wallet?.user?.role || 'Unknown'}</p>
                                        <p><strong>Wallet ID:</strong> #{wallet?.id || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
                                    Balance (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="balance"
                                        value={data.balance}
                                        onChange={(e) => setData('balance', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                {errors.balance && (
                                    <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
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
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="frozen">Frozen</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="frozen_amount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Frozen Amount (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="frozen_amount"
                                        value={data.frozen_amount}
                                        onChange={(e) => setData('frozen_amount', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.frozen_amount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.frozen_amount}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="pending_amount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pending Amount (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="pending_amount"
                                        value={data.pending_amount}
                                        onChange={(e) => setData('pending_amount', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.pending_amount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.pending_amount}</p>
                                )}
                            </div>
                        </div>

                        {/* Current Stats Display */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-800 mb-3">Current Wallet Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Total Deposits</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(wallet?.total_deposits || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total Withdrawals</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(wallet?.total_withdrawals || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total Investments</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(wallet?.total_investments || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Available Balance</p>
                                    <p className="font-semibold text-green-600">
                                        {formatCurrency((wallet?.balance || 0) - (wallet?.frozen_amount || 0) - (wallet?.pending_amount || 0))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Link
                                href={`/admin/wallets/${wallet?.id}`}
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
                            <h3 className="text-sm font-medium text-blue-800">Wallet Editing Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Balance represents the current available funds in the wallet</li>
                                    <li>Frozen amount cannot be used for transactions</li>
                                    <li>Pending amount represents funds held for processing</li>
                                    <li>Active wallets can perform all types of transactions</li>
                                    <li>Frozen wallets cannot perform transactions</li>
                                    <li>Inactive wallets are temporarily disabled</li>
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
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Wallet</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Are you sure you want to delete {wallet?.user?.name || 'this user'}'s wallet? This action cannot be undone and will remove all transaction history.
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
                                    onClick={handleDeleteWallet}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
