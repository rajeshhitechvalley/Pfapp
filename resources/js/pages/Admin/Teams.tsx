import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Search,
    Download,
    Eye,
    Edit,
    Trash2,
    Users2,
    Target,
    X
} from 'lucide-react';

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
    teamMembers?: Array<{
        id: number;
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
    }>;
    member_count: number;
    status: string;
    created_at: string;
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        team_name: '',
        description: '',
        team_leader_id: '',
        status: 'active',
    });

    const openDeleteModal = (team: Team) => {
        setSelectedTeam(team);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedTeam(null);
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
                            <Link
                                href="/admin/teams/create"
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Team
                            </Link>
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
                                            <h3 className="text-lg font-semibold text-white truncate max-w-[180px]" title={team.name}>{team.name}</h3>
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
                                <p className="text-sm text-gray-600 mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {team.description || 'No description available'}
                                </p>

                                {/* Team Leader */}
                                <div className="mb-4">
                                    <div className="flex items-center text-sm">
                                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="font-medium text-gray-900">Team Leader:</span>
                                        <span className="ml-2 text-gray-600 truncate max-w-[150px]" title={team.team_leader?.name || 'Not assigned'}>{team.team_leader?.name || 'Not assigned'}</span>
                                    </div>
                                    {team.team_leader && (
                                        <div className="text-xs text-gray-500 ml-6">{team.team_leader.email}</div>
                                    )}
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

                                {/* Recent Members */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Members</h4>
                                    <div className="space-y-2">
                                        {team.teamMembers?.slice(0, 3).map((member) => (
                                            <div key={member.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {member.user?.name?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <span className="ml-2 text-gray-900 truncate max-w-[120px]" title={member.user?.name || member.user?.email || 'Unknown'}>{member.user?.name || member.user?.email || 'Unknown'}</span>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    member.status === 'joined' ? 'bg-green-100 text-green-800' :
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
                                        <Link
                                            href={`/admin/teams/${team.id}`}
                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                            title="View Team"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={`/admin/teams/${team.id}/edit`}
                                            className="text-green-600 hover:text-green-900 text-sm"
                                            title="Edit Team"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
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
            </div>

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
        </AdminLayout>
    );
}
