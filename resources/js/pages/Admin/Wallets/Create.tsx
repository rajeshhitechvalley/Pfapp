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
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface AdminWalletCreateProps {
    users: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
}

export default function AdminWalletCreate({ users }: AdminWalletCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        balance: '0',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/wallets/store', {
            onSuccess: () => {
                router.visit('/admin/wallets');
            },
            onError: (errors) => {
                console.error('Create failed:', errors);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Wallet" />
            
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
                            <h1 className="text-3xl font-bold text-gray-900">Create New Wallet</h1>
                            <p className="text-gray-600 mt-1">Create a new wallet for a user</p>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Wallet Information</h2>
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
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select User</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email}) - {user.role}
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
                                    Initial Balance (INR)
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
                        </div>

                        {/* User Info Preview */}
                        {data.user_id && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <User className="h-6 w-6 text-blue-600 mt-1" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Selected User</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            {(() => {
                                                const user = users.find(u => u.id === parseInt(data.user_id));
                                                return user ? (
                                                    <div>
                                                        <p><strong>Name:</strong> {user.name}</p>
                                                        <p><strong>Email:</strong> {user.email}</p>
                                                        <p><strong>Role:</strong> {user.role}</p>
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
                                href="/admin/wallets"
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Creating...' : 'Create Wallet'}
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
                            <h3 className="text-sm font-medium text-blue-800">Wallet Creation Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Each user can only have one wallet</li>
                                    <li>Initial balance can be set to 0 or a positive amount</li>
                                    <li>Active wallets can receive deposits and make withdrawals</li>
                                    <li>Frozen wallets cannot perform transactions</li>
                                    <li>Inactive wallets are temporarily disabled</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Users Info */}
                {users.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">No Available Users</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>All users already have wallets. Each user can only have one wallet.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Available Users</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Found {users.length} user{users.length !== 1 ? 's' : ''} without wallets who can receive a new wallet.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
