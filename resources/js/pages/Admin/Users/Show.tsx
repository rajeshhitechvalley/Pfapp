import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Building,
    Wallet,
    Edit,
    Users,
    Eye
} from 'lucide-react';

interface UserShowProps {
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

export default function AdminUserShow({ user }: UserShowProps) {
    return (
        <AdminLayout>
            <Head title={`User: ${user.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/admin/users"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Users
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600 mt-1">User Details and Information</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                        </Link>
                    </div>
                </div>

                {/* User Overview */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">User Overview</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                                    user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {user.status?.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <p className="text-lg font-semibold text-gray-900">{user.role?.replace('_', ' ').toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">KYC Status</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.kyc_verified ? 'VERIFIED' : 'PENDING'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Registration</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.registration_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.registration_approved ? 'APPROVED' : 'PENDING'}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
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
                            <div>
                                <p className="text-sm text-gray-600">Last Updated</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(user.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-900">{user.email}</p>
                                </div>
                            </div>
                            {user.phone && (
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium text-gray-900">{user.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Wallet Information */}
                {user.wallet && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Wallet Information</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">Current Balance</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${user.wallet.balance.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Deposits</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        ${user.wallet.total_deposits.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Withdrawals</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        ${user.wallet.total_withdrawals.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Information */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Team Information</h2>
                    </div>
                    <div className="p-6">
                        {user.ledTeam ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Team Leadership</p>
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Building className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{user.ledTeam.team_name}</p>
                                                <p className="text-sm text-gray-500">Team Leader</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/admin/teams/${user.ledTeam.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            View Team
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Not leading any team</p>
                        )}

                        {user.teamMemberships && user.teamMemberships.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm text-gray-600 mb-3">Team Memberships</p>
                                <div className="space-y-2">
                                    {user.teamMemberships.map((membership) => (
                                        <div key={membership.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{membership.team.team_name}</p>
                                                    <p className="text-sm text-gray-500">Member since {new Date(membership.joined_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                membership.status === 'active' ? 'bg-green-100 text-green-800' :
                                                membership.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {membership.status?.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
