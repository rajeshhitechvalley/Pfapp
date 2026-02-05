import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, UserCheck, FileText } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'investor' | 'team_leader' | 'admin';
    status: 'inactive' | 'active';
    kyc_verified: boolean;
    registration_fee_paid: number;
    registration_approved: boolean;
    referral_code: string;
    wallet?: {
        balance: number;
        status: string;
    };
    led_team?: {
        id: number;
        team_name: string;
        member_count: number;
        status: string;
    };
}

interface UsersIndexProps {
    users: {
        data: User[];
        links: any;
        meta: any;
    };
    filters: {
        role?: string;
        status?: string;
        search?: string;
    };
}

export default function UsersIndex({ users, filters }: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter
        }, { preserveState: true });
    };

    const deleteUser = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${userId}`, {
                onSuccess: () => {
                    // User deleted successfully
                },
                onError: (errors) => {
                    alert('Error deleting user: ' + Object.values(errors).join(', '));
                }
            });
        }
    };

    const activateUser = (userId: number) => {
        router.post(`/users/${userId}/activate`, {}, {
            onSuccess: () => {
                // User activated successfully
            },
            onError: (errors) => {
                alert('Error activating user: ' + Object.values(errors).join(', '));
            }
        });
    };

    return (
        <>
            <Head title="Users" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
                                <Link
                                    href="/users/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring focus:ring-blue-300 disabled:opacity-25 transition"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add User
                                </Link>
                            </div>

                            {/* Filters */}
                            <form onSubmit={handleSearch} className="mb-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Roles</option>
                                            <option value="investor">Investor</option>
                                            <option value="team_leader">Team Leader</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
                                        >
                                            <Search className="w-4 h-4 inline mr-2" />
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Users Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                KYC
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registration Fee
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Wallet Balance
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.data.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                        <div className="text-sm text-gray-500">{user.phone}</div>
                                                        <div className="text-xs text-gray-400">Ref: {user.referral_code}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'team_leader' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {user.kyc_verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{user.registration_fee_paid}
                                                    {user.registration_approved && (
                                                        <span className="ml-2 text-green-600">✓</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{user.wallet?.balance || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/users/${user.id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/users/${user.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        {user.status === 'inactive' && user.registration_fee_paid >= 500 && (
                                                            <button
                                                                onClick={() => activateUser(user.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Activate User"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-6">
                                {users.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || ''}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 mr-2 text-sm ${
                                            link.active
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-blue-500 border border-blue-500'
                                        } rounded`}
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
