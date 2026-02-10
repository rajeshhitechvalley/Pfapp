import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';
import { 
    Users, 
    ArrowLeft,
    Building,
    Save,
    X,
    Trash2,
    Shield,
    ShieldOff,
    UserPlus,
    UserMinus,
    AlertTriangle,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Edit as EditIcon,
    Eye
} from 'lucide-react';

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

interface AdminTeamEditProps {
    team: Team;
}

export default function AdminTeamEdit({ team }: AdminTeamEditProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMemberActions, setShowMemberActions] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    // Static list of available users for now (in production, this should come from the database)
    const availableUsers = [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        { id: 2, name: 'John Investor', email: 'john@example.com', role: 'investor' },
        { id: 3, name: 'Jane Investor', email: 'jane@example.com', role: 'investor' },
        { id: 4, name: 'Michael Investor', email: 'michael.investor@example.com', role: 'investor' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        team_name: team.team_name,
        description: team.description || '',
        team_leader_id: team.team_leader_id?.toString() || '',
        status: team.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/teams/${team.id}/update`, {
            onSuccess: () => {
                router.visit(`/admin/teams/${team.id}`);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const handleDeleteTeam = () => {
        router.delete(`/admin/teams/${team.id}`, {
            onSuccess: () => {
                router.visit('/admin/teams');
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                setShowDeleteModal(false);
            }
        });
    };

    const handleRemoveMember = (member: TeamMember) => {
        if (confirm(`Are you sure you want to remove ${member.user?.name || 'this member'} from the team?`)) {
            router.post(`/admin/teams/${team.id}/remove-member`, {
                user_id: member.user_id
            }, {
                onSuccess: () => {
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Remove member failed:', errors);
                }
            });
        }
    };

    const handleToggleMemberStatus = (member: TeamMember) => {
        const newStatus = member.status === 'active' ? 'inactive' : 'active';
        router.post(`/admin/teams/${team.id}/toggle-member-status`, {
            user_id: member.user_id,
            status: newStatus
        }, {
            onSuccess: () => {
                router.reload();
            },
            onError: (errors) => {
                console.error('Toggle status failed:', errors);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit Team: ${team.team_name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={`/admin/teams/${team.id}`}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Team
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Team</h1>
                            <p className="text-gray-600 mt-1">Update team information and manage members</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/teams/${team.id}`}
                            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Team
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Team Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    id="team_name"
                                    value={data.team_name}
                                    onChange={(e) => setData('team_name', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter team name"
                                    required
                                />
                                {errors.team_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.team_name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="team_leader_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Team Leader
                                </label>
                                <select
                                    id="team_leader_id"
                                    value={data.team_leader_id}
                                    onChange={(e) => setData('team_leader_id', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Team Leader</option>
                                    {availableUsers?.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.team_leader_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.team_leader_id}</p>
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
                                    <option value="pending">Pending</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
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
                                placeholder="Enter team description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Link
                                href={`/admin/teams/${team.id}`}
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

                {/* Team Members Management */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Team Members Management</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {team.teamMembers?.length || 0} members
                            </p>
                        </div>
                        <Link
                            href={`/admin/teams/${team.id}/add-members`}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Members
                        </Link>
                    </div>
                    <div className="p-6">
                        {team.teamMembers && team.teamMembers.length > 0 ? (
                            <div className="space-y-3">
                                {team.teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {member.user?.name?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{member.user?.email || 'No email'}</p>
                                                <p className="text-xs text-gray-400">Role: {member.user?.role?.replace('_', ' ').toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                member.status === 'joined' ? 'bg-green-100 text-green-800' :
                                                member.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                member.status === 'active' ? 'bg-green-100 text-green-800' :
                                                member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {member.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {member.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
                                                {member.status === 'assigned' && <Shield className="w-3 h-3 mr-1" />}
                                                {member.status?.toUpperCase()}
                                            </span>
                                            
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowMemberActions(showMemberActions === member.id ? null : member.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                
                                                {showMemberActions === member.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    handleToggleMemberStatus(member);
                                                                    setShowMemberActions(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {member.status === 'active' ? (
                                                                    <>
                                                                        <ShieldOff className="w-4 h-4 mr-2" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Shield className="w-4 h-4 mr-2" />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </button>
                                                            <Link
                                                                href={`/admin/users/${member.user_id}`}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Profile
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    handleRemoveMember(member);
                                                                    setShowMemberActions(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <UserMinus className="w-4 h-4 mr-2" />
                                                                Remove from Team
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No members in this team</p>
                                <Link
                                    href={`/admin/teams/${team.id}/add-members`}
                                    className="inline-flex items-center mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add First Member
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Team Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="p-6">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                    Delete Team
                                </h3>
                                <p className="text-sm text-gray-500 text-center mb-6">
                                    Are you sure you want to delete the team "{team.team_name}"? This action cannot be undone and will remove all team associations.
                                </p>
                                <div className="flex justify-center space-x-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteTeam}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Delete Team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
