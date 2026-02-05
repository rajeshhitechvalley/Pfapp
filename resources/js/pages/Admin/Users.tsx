import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    Users, 
    Mail, 
    Phone, 
    Shield, 
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    CheckCircle,
    XCircle,
    Clock,
    X
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    kyc_verified: boolean;
    registration_fee_paid: number;
    wallet?: {
        balance: number;
        total_deposits: number;
    };
    ledTeam?: {
        id: number;
        name: string;
        member_count: number;
    };
    teamMemberships?: {
        id: number;
        name: string;
    }[];
    created_at: string;
}

interface AdminUsersProps {
    users: User[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export default function AdminUsers({ users, pagination }: AdminUsersProps) {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'investor',
        password: '',
        password_confirmation: '',
    });

    const { data: editData, setData: setEditData, put: updatePost, processing: editProcessing, errors: editErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'investor',
        status: 'active',
    });

    const openAddUserModal = () => {
        setShowAddUserModal(true);
        setData('name', '');
        setData('email', '');
        setData('phone', '');
        setData('role', 'investor');
        setData('password', '');
        setData('password_confirmation', '');
    };

    const closeAddUserModal = () => {
        setShowAddUserModal(false);
        setData('name', '');
        setData('email', '');
        setData('phone', '');
        setData('role', 'investor');
        setData('password', '');
        setData('password_confirmation', '');
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    const openViewModal = (user: User) => {
        setSelectedUser(user);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedUser(null);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditData('name', user.name);
        setEditData('email', user.email);
        setEditData('phone', user.phone || '');
        setEditData('role', user.role);
        setEditData('status', user.status);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedUser(null);
        setEditData('name', '');
        setEditData('email', '');
        setEditData('phone', '');
        setEditData('role', 'investor');
        setEditData('status', 'active');
    };

    const submitAddUser = () => {
        post('/admin/users/store', {
            onSuccess: () => {
                    closeAddUserModal();
                    router.reload();
                },
                onError: (errors: any) => {
                    console.error('Error adding user:', errors);
                }
            });
    };

    const submitEditUser = () => {
        if (selectedUser) {
            updatePost(`/admin/users/${selectedUser.id}/update`, {
                onSuccess: () => {
                    closeEditModal();
                    router.reload();
                },
                onError: (errors: any) => {
                    console.error('Error updating user:', errors);
                }
            });
        }
    };

    const deleteUser = () => {
        if (selectedUser) {
            router.delete(`/admin/users/${selectedUser.id}`, {
                onSuccess: () => {
                    closeDeleteModal();
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error deleting user:', errors);
                }
            });
        }
    };

    const toggleUserStatus = (user: User) => {
        router.patch(`/admin/users/${user.id}/toggle-status`, {
            onSuccess: () => {
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error toggling user status:', errors);
                }
            });
    };

    const verifyUser = (user: User) => {
        router.patch(`/admin/users/${user.id}/verify`, {
            onSuccess: () => {
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error verifying user:', errors);
                }
            });
    };
    return (
        <AdminLayout title="User Management">
            <Head title="Users - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage all registered users and their accounts</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={openAddUserModal}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add User
                            </button>
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="team_leader">Team Leader</option>
                            <option value="investor">Investor</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">KYC Status</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
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
                                        Wallet Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">ID: #{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center mt-1">
                                                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                user.role === 'team_leader' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role?.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {user.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {user.kyc_verified ? 'VERIFIED' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ₹{user.wallet?.balance?.toLocaleString() || '0'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    onClick={() => openViewModal(user)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                                    title="View User"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(user)}
                                                    className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                                    title="Edit User"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(user)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
                            <span className="font-medium">{pagination.total}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button 
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                disabled={pagination.current_page <= 1}
                            >
                                Previous
                            </button>
                            <button 
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                disabled={pagination.current_page >= pagination.last_page}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add User Modal */}
                {showAddUserModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
                                <button
                                    onClick={closeAddUserModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); submitAddUser(); }} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter user name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="investor">Investor</option>
                                        <option value="team_leader">Team Leader</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter password"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeAddUserModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Adding...' : 'Add User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                                        <p className="text-sm text-gray-600">
                                            Are you sure you want to delete {selectedUser.name}? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={closeDeleteModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={deleteUser}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View User Modal */}
                {showViewModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 scale-100">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                                <button
                                    onClick={closeViewModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm text-gray-600">Name:</span>
                                                <span className="ml-2 text-sm font-medium text-gray-900">{selectedUser.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Email:</span>
                                                <span className="ml-2 text-sm font-medium text-gray-900">{selectedUser.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Phone:</span>
                                                <span className="ml-2 text-sm font-medium text-gray-900">{selectedUser.phone || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Role:</span>
                                                <span className="ml-2 text-sm font-medium text-gray-900">{selectedUser.role?.replace('_', ' ').toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Account Status</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm text-gray-600">Status:</span>
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    selectedUser.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {selectedUser.status?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">KYC Status:</span>
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    selectedUser.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {selectedUser.kyc_verified ? 'VERIFIED' : 'PENDING'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Wallet Balance:</span>
                                                <span className="ml-2 text-sm font-medium text-gray-900">₹{selectedUser.wallet?.balance?.toLocaleString() || '0'}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Joined:</span>
                                                <span className="ml-2 text-sm font-medium text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-end">
                                    <button
                                        onClick={closeViewModal}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {showEditModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                                <button
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); submitEditUser(); }} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter user name"
                                        required
                                    />
                                    {editErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {editErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={editData.phone}
                                        onChange={(e) => setEditData('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter phone number"
                                    />
                                    {editErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="investor">Investor</option>
                                        <option value="team_leader">Team Leader</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {editErrors.role && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.role}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                    {editErrors.status && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.status}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {editProcessing ? 'Updating...' : 'Update User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {pagination && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {pagination.from} to {pagination.to} of {pagination.total} results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                    disabled={pagination.current_page === 1}
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <button
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
