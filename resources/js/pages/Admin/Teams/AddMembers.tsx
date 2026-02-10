import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft,
    Users,
    Search,
    Plus,
    X,
    UserPlus,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface AvailableUser {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

interface TeamMember {
    id: string;
    user_id: number;
    team_id: number;
    status: string;
    joined_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface Team {
    id: number;
    team_name: string;
    description?: string;
    status: string;
    member_count: number;
    team_leader?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    teamMembers: TeamMember[];
    created_at: string;
    updated_at: string;
}

interface AddMembersProps {
    team: Team;
    availableUsers: AvailableUser[];
}

export default function AdminTeamAddMembers({ team, availableUsers }: AddMembersProps) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        role: 'member',
    });

    const [selectedUsers, setSelectedUsers] = useState<AvailableUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUserSelect = (user: AvailableUser) => {
        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedUsers.length === 0) {
            alert('Please select at least one user to add to the team.');
            return;
        }

        // Set the user_id field with comma-separated IDs
        const userIds = selectedUsers.map(u => u.id).join(',');
        setData('user_id', userIds);

        // Small delay to ensure form data is updated
        setTimeout(() => {
            post(`/admin/teams/${team.id}/add-members`, {
                onSuccess: () => {
                    router.visit(`/admin/teams/${team.id}/edit`);
                },
                onError: (errors: any) => {
                    console.error('Error adding members:', errors);
                }
            });
        }, 100);
    };

    return (
        <AdminLayout>
            <Head title={`Add Members to ${team.team_name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={`/admin/teams/${team.id}/edit`}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Team
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add Team Members</h1>
                            <p className="text-gray-600 mt-1">Add new members to {team.team_name}</p>
                        </div>
                    </div>
                </div>

                {/* Team Info */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Team Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Team Name</p>
                                <p className="text-lg font-semibold text-gray-900">{team.team_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Members</p>
                                <p className="text-lg font-semibold text-gray-900">{team.teamMembers?.length || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Team Leader</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {team.team_leader?.name || 'Not assigned'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Members Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Select Members to Add</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Available Users */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Available Users ({filteredUsers.length})
                            </h3>
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                                {filteredUsers.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleUserSelect(user)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.some(u => u.id === user.id)}
                                                        onChange={() => {}} // Controlled by parent
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                        <p className="text-xs text-gray-400">{user.role?.replace('_', ' ').toUpperCase()}</p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.status?.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">
                                            {searchQuery ? 'No users found matching your search.' : 'No available users to add.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Selected Users ({selectedUsers.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                                        >
                                            {user.name}
                                            <button
                                                type="button"
                                                onClick={() => handleUserSelect(user)}
                                                className="ml-2 text-blue-500 hover:text-blue-700"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hidden form field */}
                        <input
                            type="hidden"
                            name="user_id"
                            value={selectedUsers.map(u => u.id).join(',')}
                            onChange={() => {}} // Controlled by parent
                        />

                        {/* Role Selection */}
                        <div className="mb-6">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Role for New Members
                            </label>
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="member">Member</option>
                                <option value="assistant_leader">Assistant Leader</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || selectedUsers.length === 0}
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    'Adding...'
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Current Team Members */}
                {team.teamMembers && team.teamMembers.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Current Team Members</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                {team.teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-600">
                                                    {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{member.user?.email || 'No email'}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            member.status === 'joined' ? 'bg-green-100 text-green-800' :
                                            member.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
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
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
