import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Save,
    X
} from 'lucide-react';

interface UserEditProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        role: string;
        status: string;
        kyc_verified: boolean;
        registration_fee_paid: number;
        registration_approved: boolean;
        created_at: string;
        updated_at: string;
        wallet?: {
            balance: number;
            total_deposits: number;
            total_withdrawals: number;
        };
        ledTeam?: {
            id: number;
            team_name: string;
            status: string;
        };
        teamMemberships?: Array<{
            id: number;
            team: {
                id: number;
                team_name: string;
                status: string;
            };
            status: string;
            joined_at: string;
        }>;
    };
}

export default function AdminUserEdit({ user }: UserEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        kyc_verified: user.kyc_verified,
        registration_approved: user.registration_approved,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}/update`, {
            onSuccess: () => {
                router.visit(`/admin/users/${user.id}`);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit User: ${user.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={`/admin/users/${user.id}`}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to User
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                            <p className="text-gray-600 mt-1">Update user information and settings</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/users/${user.id}`}
                            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Link>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter full name"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter email address"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter phone number"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="team_leader">Team Leader</option>
                                    <option value="investor">Investor</option>
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="kyc_verified" className="block text-sm font-medium text-gray-700 mb-2">
                                    KYC Verification
                                </label>
                                <select
                                    id="kyc_verified"
                                    value={data.kyc_verified.toString()}
                                    onChange={(e) => setData('kyc_verified', e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="true">Verified</option>
                                    <option value="false">Pending</option>
                                </select>
                                {errors.kyc_verified && (
                                    <p className="mt-1 text-sm text-red-600">{errors.kyc_verified}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="registration_approved" className="block text-sm font-medium text-gray-700 mb-2">
                                    Registration Approval
                                </label>
                                <select
                                    id="registration_approved"
                                    value={data.registration_approved.toString()}
                                    onChange={(e) => setData('registration_approved', e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="true">Approved</option>
                                    <option value="false">Pending</option>
                                </select>
                                {errors.registration_approved && (
                                    <p className="mt-1 text-sm text-red-600">{errors.registration_approved}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Link
                                href={`/admin/users/${user.id}`}
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

                {/* User Summary */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">User Summary</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Registration Fee</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    ${user.registration_fee_paid}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Member Since</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            {user.wallet && (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-600">Wallet Balance</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            ${user.wallet.balance.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Deposits</p>
                                        <p className="text-lg font-semibold text-green-600">
                                            ${user.wallet.total_deposits.toFixed(2)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
