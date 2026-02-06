import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { 
    Users, 
    ArrowLeft,
    Building,
    Calendar,
    MapPin,
    UserPlus,
    Edit,
    Trash2
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

interface AdminTeamShowProps {
    team: Team;
}

export default function AdminTeamShow({ team }: AdminTeamShowProps) {
    return (
        <AdminLayout>
            <Head title={`Team: ${team.team_name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/admin/teams"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Teams
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{team.team_name}</h1>
                            <p className="text-gray-600 mt-1">Team Details and Members</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/teams/${team.id}/edit`}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Team
                        </Link>
                    </div>
                </div>

                {/* Team Overview */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Team Overview</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    team.status === 'active' ? 'bg-green-100 text-green-800' :
                                    team.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {team.status?.toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Members</p>
                                <p className="text-lg font-semibold text-gray-900">{team.teamMembers?.length || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(team.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Last Updated</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(team.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        {team.description && (
                            <div className="mt-6">
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="text-gray-900 mt-1">{team.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Team Leader */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Team Leader</h2>
                    </div>
                    <div className="p-6">
                        {team.team_leader ? (
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                        {team.team_leader.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-base font-medium text-gray-900">{team.team_leader.name}</p>
                                    <p className="text-sm text-gray-500">{team.team_leader.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">Role: {team.team_leader.role?.replace('_', ' ').toUpperCase()}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No team leader assigned</p>
                        )}
                    </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                        <span className="text-sm text-gray-500">
                            {team.teamMembers?.length || 0} members
                        </span>
                    </div>
                    <div className="p-6">
                        {team.teamMembers && team.teamMembers.length > 0 ? (
                            <div className="space-y-3">
                                {team.teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                                                {member.status?.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Joined {new Date(member.joined_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No members in this team</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
