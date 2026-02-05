import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Users2,
    Target,
    X
} from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    kyc_verified: boolean;
}

interface Team {
    id: number;
    name: string;
    description: string;
    team_leader_id: number;
    team_leader?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    team_members: Array<{
        id: number;
        name: string;
        email: string;
        status: string;
    }>;
    member_count: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AdminTeamsProps {
    teams: Team[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export default function AdminTeams({ teams, pagination }: AdminTeamsProps) {
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamLeaderSearch, setTeamLeaderSearch] = useState('');
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        team_name: '',
        description: '',
        team_leader_id: '',
        status: 'active',
    });

    const { data: editData, setData: setEditData, put: updatePost, processing: editProcessing, errors: editErrors } = useForm({
        team_name: '',
        description: '',
        team_leader_id: '',
        status: 'active',
    });

    const { data: memberData, setData: setMemberData, post: addMemberPost, processing: memberProcessing, errors: memberErrors } = useForm({
        user_id: '',
        role: 'member',
    });

    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const openCreateTeamModal = () => {
        setShowCreateTeamModal(true);
        setData('team_name', '');
        setData('description', '');
        setData('team_leader_id', '');
        setData('status', 'active');
        setTeamLeaderSearch('');
        // Fetch available users for team leaders
        fetchAvailableUsers();
    };

    const closeCreateTeamModal = () => {
        setShowCreateTeamModal(false);
        setData('team_name', '');
        setData('description', '');
        setData('team_leader_id', '');
        setData('status', 'active');
        setTeamLeaderSearch('');
        setAvailableUsers([]);
    };

    const fetchAvailableUsers = async () => {
        try {
            const response = await fetch('/admin/users/search?q=');
            const users = await response.json();
            setAvailableUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to empty array
            setAvailableUsers([]);
        }
    };

    const searchUsers = async (query: string) => {
        if (query.length < 2) {
            setAvailableUsers([]);
            return;
        }
        
        try {
            const response = await fetch(`/admin/users/search?q=${encodeURIComponent(query)}`);
            const users = await response.json();
            setAvailableUsers(users);
        } catch (error) {
            console.error('Error searching users:', error);
            setAvailableUsers([]);
        }
    };

    const handleTeamLeaderSelect = (user: any) => {
        setData('team_leader_id', user.id.toString());
        setTeamLeaderSearch(`${user.name} (${user.email})`);
    };

    const handleMemberSelect = (user: any) => {
        // Check if user is already selected
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setShowUserDropdown(false);
        setTeamLeaderSearch(''); // Clear search after selection
    };

    const removeSelectedUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const openAddMemberModal = (team: Team) => {
        setSelectedTeam(team);
        setSelectedUsers([]);
        setMemberData('user_id', '');
        setMemberData('role', 'member');
        setShowUserDropdown(false);
        setTeamLeaderSearch('');
        setShowAddMemberModal(true);
    };

    const closeAddMemberModal = () => {
        setShowAddMemberModal(false);
        setSelectedTeam(null);
        setSelectedUsers([]);
        setMemberData('user_id', '');
        setMemberData('role', 'member');
        setShowUserDropdown(false);
        setTeamLeaderSearch('');
    };

    const openDeleteModal = (team: Team) => {
        setSelectedTeam(team);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedTeam(null);
    };

    const openViewModal = (team: Team) => {
        setSelectedTeam(team);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedTeam(null);
    };

    const openEditModal = (team: Team) => {
        setSelectedTeam(team);
        setEditData('team_name', team.name);
        setEditData('description', team.description || '');
        setEditData('team_leader_id', team.team_leader?.id?.toString() || '');
        setEditData('status', team.status);
        
        // Set team leader search field to show current team leader
        if (team.team_leader) {
            setTeamLeaderSearch(`${team.team_leader.name} (${team.team_leader.email})`);
        } else {
            setTeamLeaderSearch('');
        }
        
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedTeam(null);
        setEditData('team_name', '');
        setEditData('description', '');
        setEditData('team_leader_id', '');
        setEditData('status', 'active');
        setTeamLeaderSearch(''); // Clear team leader search
    };

    const submitCreateTeam = () => {
        post('/admin/teams/store', {
            onSuccess: () => {
                closeCreateTeamModal();
                router.reload();
            },
            onError: (errors: any) => {
                console.error('Error creating team:', errors);
            }
        });
    };

    const submitEditTeam = () => {
        if (selectedTeam) {
            updatePost(`/admin/teams/${selectedTeam.id}/update`, {
                onSuccess: () => {
                    closeEditModal();
                    router.reload();
                },
                onError: (errors: any) => {
                    console.error('Error updating team:', errors);
                }
            });
        }
    };

    const submitAddMember = () => {
        if (selectedTeam && selectedUsers.length > 0) {
            // Send all selected user IDs
            const userIds = selectedUsers.map(user => user.id);
            
            // Set the form data properly
            setMemberData('user_id', userIds.join(','));
            
            addMemberPost(`/admin/teams/${selectedTeam.id}/add-members`, {
                onSuccess: () => {
                    closeAddMemberModal();
                    router.reload();
                },
                onError: (errors: any) => {
                    console.error('Error adding members:', errors);
                }
            });
        }
    };

    const deleteTeam = () => {
        if (selectedTeam) {
            router.delete(`/admin/teams/${selectedTeam.id}`, {
                onSuccess: () => {
                    closeDeleteModal();
                    router.reload();
                },
                onError: (errors: any) => {
                    console.error('Error deleting team:', errors);
                }
            });
        }
    };
    return (
        <AdminLayout title="Team Management">
            <Head title="Teams - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage all teams and their members</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={openCreateTeamModal}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Team
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
                                placeholder="Search teams..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Member Count</option>
                            <option value="1-10">1-10 Members</option>
                            <option value="11-20">11-20 Members</option>
                            <option value="20+">20+ Members</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Created Date</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                            {/* Team Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                                            <Users2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                                            <p className="text-sm text-blue-100">Team ID: #{team.id}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        team.status === 'active' ? 'bg-green-100 text-green-800' :
                                        team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {team.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Team Info */}
                            <div className="p-4">
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {team.description || 'No description available'}
                                </p>

                                {/* Team Leader */}
                                <div className="mb-4">
                                    <div className="flex items-center text-sm">
                                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="font-medium text-gray-900">Team Leader:</span>
                                        <span className="ml-2 text-gray-600">{team.team_leader.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 ml-6">{team.team_leader.email}</div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <Users className="h-5 w-5 text-blue-500 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Members</p>
                                                <p className="text-sm font-semibold text-gray-900">{team.member_count}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <Target className="h-5 w-5 text-green-500 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Status</p>
                                                <p className="text-sm font-semibold text-gray-900 capitalize">{team.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Member Button */}
                                <div className="mb-4">
                                    <button
                                        onClick={() => openAddMemberModal(team)}
                                        className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Member
                                    </button>
                                </div>

                                {/* Recent Members */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Members</h4>
                                    <div className="space-y-2">
                                        {team.team_members?.slice(0, 3).map((member) => (
                                            <div key={member.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="ml-2 text-gray-900">{member.name}</span>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    member.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {member.status?.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-500">
                                        Created {new Date(team.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => openViewModal(team)}
                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                            title="View Team"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(team)}
                                            className="text-green-600 hover:text-green-900 text-sm"
                                            title="Edit Team"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => openDeleteModal(team)}
                                            className="text-red-600 hover:text-red-900 text-sm"
                                            title="Delete Team"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
                            <span className="font-medium">{pagination.total}</span> teams
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

                {/* Create Team Modal */}
                {showCreateTeamModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
                                <button
                                    onClick={closeCreateTeamModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); submitCreateTeam(); }} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                                    <input
                                        type="text"
                                        value={data.team_name}
                                        onChange={(e) => setData('team_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter team name"
                                        required
                                    />
                                    {errors.team_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.team_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter team description"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Leader</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={teamLeaderSearch}
                                            onChange={(e) => {
                                                setTeamLeaderSearch(e.target.value);
                                                searchUsers(e.target.value);
                                            }}
                                            onFocus={() => fetchAvailableUsers()}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search team leader by name or email..."
                                        />
                                        {availableUsers.length > 0 && teamLeaderSearch && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {availableUsers.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => handleTeamLeaderSelect(user)}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                            </div>
                                                            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                                {user.role.replace('_', ' ').toUpperCase()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="hidden"
                                        value={data.team_leader_id}
                                        onChange={(e) => setData('team_leader_id', e.target.value)}
                                    />
                                    {errors.team_leader_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.team_leader_id}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeCreateTeamModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Creating...' : 'Create Team'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedTeam && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Delete Team</h3>
                                        <p className="text-sm text-gray-600">
                                            Are you sure you want to delete {selectedTeam.name}? This action cannot be undone and will also remove all team members.
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
                                        onClick={deleteTeam}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Deleting...' : 'Delete Team'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Team Modal */}
                {showViewModal && selectedTeam && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Team Details</h3>
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
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Team Information</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Team Name</p>
                                                <p className="text-base font-semibold text-gray-900">{selectedTeam.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Description</p>
                                                <p className="text-base text-gray-900">{selectedTeam.description || 'No description'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    selectedTeam.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    selectedTeam.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {selectedTeam.status?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Created</p>
                                                <p className="text-base text-gray-900">{new Date(selectedTeam.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Team Leader</h4>
                                        <div className="space-y-3">
                                            {selectedTeam.team_leader ? (
                                                <>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {selectedTeam.team_leader.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-medium text-gray-900">{selectedTeam.team_leader.name}</p>
                                                            <p className="text-sm text-gray-500">{selectedTeam.team_leader.email}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Role</p>
                                                        <p className="text-base text-gray-900">{selectedTeam.team_leader.role?.replace('_', ' ').toUpperCase()}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500">No team leader assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3">Team Members ({selectedTeam.team_members?.length || 0})</h4>
                                    <div className="max-h-48 overflow-y-auto">
                                        <div className="space-y-2">
                                            {selectedTeam.team_members?.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                            <p className="text-xs text-gray-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {member.status?.toUpperCase()}
                                                    </span>
                                                </div>
                                            ))}
                                            {(!selectedTeam.team_members || selectedTeam.team_members.length === 0) && (
                                                <p className="text-sm text-gray-500 text-center py-4">No members in this team</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-end">
                                    <button
                                        onClick={closeViewModal}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Team Modal */}
                {showEditModal && selectedTeam && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Team</h3>
                                <button
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Team Information */}
                                <form onSubmit={(e) => { e.preventDefault(); submitEditTeam(); }} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                                        <input
                                            type="text"
                                            value={editData.team_name}
                                            onChange={(e) => setEditData('team_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter team name"
                                            required
                                        />
                                        {editErrors.team_name && (
                                            <p className="mt-1 text-sm text-red-600">{editErrors.team_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            value={editData.description}
                                            onChange={(e) => setEditData('description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter team description"
                                            rows={3}
                                        />
                                        {editErrors.description && (
                                            <p className="mt-1 text-sm text-red-600">{editErrors.description}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Leader</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={teamLeaderSearch}
                                                onChange={(e) => {
                                                    setTeamLeaderSearch(e.target.value);
                                                    searchUsers(e.target.value);
                                                }}
                                                onFocus={() => fetchAvailableUsers()}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Search team leader by name or email..."
                                            />
                                            {availableUsers.length > 0 && teamLeaderSearch && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {availableUsers.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            onClick={() => handleTeamLeaderSelect(user)}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                                    {user.role.replace('_', ' ').toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="hidden"
                                            value={editData.team_leader_id}
                                            onChange={(e) => setEditData('team_leader_id', e.target.value)}
                                        />
                                        {editErrors.team_leader_id && (
                                            <p className="mt-1 text-sm text-red-600">{editErrors.team_leader_id}</p>
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
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                                            disabled={editProcessing}
                                        >
                                            {editProcessing ? 'Updating...' : 'Update Team'}
                                        </button>
                                    </div>
                                </form>

                                {/* Right Column - Team Members */}
                                <div className="p-6 border-l border-gray-200">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Current Team Members</h4>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Total Members:</span>
                                            <span className="font-semibold text-gray-900">{selectedTeam.team_members?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {selectedTeam.team_members?.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-blue-600">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                        <p className="text-xs text-gray-500">{member.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    member.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {member.status?.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                        {(!selectedTeam.team_members || selectedTeam.team_members.length === 0) && (
                                            <div className="text-center py-8">
                                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-sm text-gray-500">No members in this team</p>
                                                <p className="text-xs text-gray-400 mt-1">Use the "Add Member" button to add team members</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                closeEditModal();
                                                openAddMemberModal(selectedTeam);
                                            }}
                                            className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add New Member
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Member Modal */}
                {showAddMemberModal && selectedTeam && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Add Team Member</h3>
                                <button
                                    onClick={closeAddMemberModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); submitAddMember(); }} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                                        <p className="text-sm font-medium text-gray-900">{selectedTeam.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Users</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={teamLeaderSearch}
                                            onChange={(e) => {
                                                setTeamLeaderSearch(e.target.value);
                                                searchUsers(e.target.value);
                                                setShowUserDropdown(true);
                                            }}
                                            onFocus={() => {
                                                fetchAvailableUsers();
                                                setShowUserDropdown(true);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search user by name or email..."
                                        />
                                        {showUserDropdown && availableUsers.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {availableUsers
                                                    .filter(user => !selectedUsers.find(selected => selected.id === user.id))
                                                    .map((user) => (
                                                        <div
                                                            key={user.id}
                                                            onClick={() => handleMemberSelect(user)}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                                    {user.role.replace('_', ' ').toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Selected Users Display */}
                                    {selectedUsers.length > 0 && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Users ({selectedUsers.length})</label>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {selectedUsers.map((user) => (
                                                    <div key={user.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                        <div className="flex items-center">
                                                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                                                <span className="text-xs font-medium text-blue-600">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-xs text-gray-500">{user.email}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSelectedUser(user.id)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <input
                                        type="hidden"
                                        value={selectedUsers.map(u => u.id).join(',')}
                                        onChange={(e) => setMemberData('user_id', e.target.value)}
                                    />
                                    {memberErrors.user_id && (
                                        <p className="mt-1 text-sm text-red-600">{memberErrors.user_id}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={memberData.role}
                                        onChange={(e) => setMemberData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="member">Member</option>
                                        <option value="assistant_leader">Assistant Leader</option>
                                    </select>
                                    {memberErrors.role && (
                                        <p className="mt-1 text-sm text-red-600">{memberErrors.role}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeAddMemberModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={memberProcessing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {memberProcessing ? 'Adding...' : 'Add Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
