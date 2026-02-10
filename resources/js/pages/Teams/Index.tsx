import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Users, UserPlus, UserCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface TeamMember {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    status: string;
    joined_at: string;
}

interface Team {
    id: number;
    team_name: string;
    member_count: number;
    team_value: number;
    total_investments: number;
    status: 'pending' | 'active' | 'inactive';
    activated_at?: string;
    team_leader: {
        id: number;
        name: string;
        email: string;
    };
    team_members: TeamMember[];
}

interface TeamsIndexProps {
    teams: {
        data: Team[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
    };
}

export default function TeamsIndex({ teams, filters }: TeamsIndexProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/teams', {
            status: statusFilter
        }, { preserveState: true });
    };

    const deleteTeam = (teamId: number) => {
        if (confirm('Are you sure you want to delete this team?')) {
            router.delete(`/teams/${teamId}`, {
                onSuccess: () => {
                    // Team deleted successfully
                },
                onError: (errors) => {
                    alert('Error deleting team: ' + Object.values(errors).join(', '));
                }
            });
        }
    };

    const activateTeam = (teamId: number) => {
        router.post(`/teams/${teamId}/activate`, {}, {
            onSuccess: () => {
                // Team activated successfully
            },
            onError: (errors) => {
                alert('Error activating team: ' + Object.values(errors).join(', '));
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Teams" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900">Teams Management</h1>
                                <Link
                                    href="/teams/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring focus:ring-blue-300 disabled:opacity-25 transition"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Team
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <button
                                            onClick={handleFilter}
                                            className="w-full px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
                                        >
                                            <Search className="w-4 h-4 inline mr-2" />
                                            Filter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Teams Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team Leader
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Members
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team Value
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Investments
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teams.data.map((team) => (
                                            <tr key={team.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{team.team_name}</div>
                                                    {team.activated_at && (
                                                        <div className="text-xs text-gray-500">
                                                            Activated: {new Date(team.activated_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{team.team_leader.name}</div>
                                                    <div className="text-xs text-gray-500">{team.team_leader.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span className="text-sm text-gray-900">{team.member_count}/20</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {team.member_count >= 20 ? 'Complete' : `${20 - team.member_count} needed`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{team.team_value.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{team.total_investments.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        team.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {team.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/teams/${team.id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/teams/${team.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        {team.status === 'pending' && team.member_count >= 20 && (
                                                            <button
                                                                onClick={() => activateTeam(team.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Activate Team"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteTeam(team.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete Team"
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
                                {teams.links.map((link: any, index: number) => (
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
        </AppLayout>
    );
}
