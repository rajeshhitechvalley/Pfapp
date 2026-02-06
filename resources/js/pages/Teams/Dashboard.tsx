import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    UserPlus, 
    TrendingUp, 
    DollarSign, 
    Target,
    Share2,
    Mail,
    MessageCircle,
    Phone,
    Copy,
    Check,
    X,
    Calendar,
    Award,
    Activity,
    BarChart3,
    PieChart,
    Filter,
    Search,
    Download,
    Eye,
    Edit
} from 'lucide-react';

interface Team {
    id: number;
    team_id: string;
    team_name: string;
    description: string;
    team_leader_id: number;
    team_leader: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    member_count: number;
    team_value: number;
    total_investments: number;
    status: string;
    activated_at?: string;
    referral_link: string;
    created_at: string;
    team_members: TeamMember[];
}

interface TeamMember {
    id: number;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
        status: string;
        kyc_verified: boolean;
    };
    status: string;
    joined_at: string;
    investment_amount: number;
}

interface TeamStats {
    total_members: number;
    active_members: number;
    inactive_members: number;
    total_investments: number;
    average_investment: number;
    growth_rate: number;
    activation_progress: number;
}

export default function TeamDashboard() {
    const [team, setTeam] = useState<Team | null>(null);
    const [stats, setStats] = useState<TeamStats | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'performance' | 'hierarchy'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const { data: inviteData, setData: setInviteData, post: postInvite, processing: inviteProcessing } = useForm({
        invite_method: 'email',
        email: '',
        phone: '',
        message: '',
    });

    useEffect(() => {
        // Fetch team data
        fetch('/api/user/team')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTeam(data.data.team);
                    setStats(data.data.stats);
                }
            });
    }, []);

    const copyReferralLink = async () => {
        if (team?.referral_link) {
            await navigator.clipboard.writeText(team.referral_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sendInvitation = (e: React.FormEvent) => {
        e.preventDefault();
        postInvite('/api/team/invite', {
            onSuccess: () => {
                setShowInviteModal(false);
                setInviteData('email', '');
                setInviteData('phone', '');
                setInviteData('message', '');
            }
        });
    };

    const filteredMembers = team?.team_members?.filter(member => {
        const matchesSearch = member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || member.user.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (!team) {
        return (
            <AppLayout>
                <Head title="Team Dashboard" />
                <div className="max-w-4xl mx-auto p-6">
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Yet</h2>
                        <p className="text-gray-600 mb-6">Create your team to start building your network</p>
                        <Button onClick={() => router.visit('/teams/create')}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Team
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Team Dashboard" />
            
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{team.team_name}</h1>
                            <p className="text-gray-600 mt-1">{team.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-500">Team ID: {team.team_id}</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    team.status === 'active' ? 'bg-green-100 text-green-800' :
                                    team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {team.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="outline" onClick={copyReferralLink}>
                                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                            <Button onClick={() => setShowInviteModal(true)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Members
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Members</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.total_members || 0}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Investments</p>
                                <p className="text-2xl font-bold text-gray-900">₹{(stats?.total_investments || 0).toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.growth_rate || 0}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Activation Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.activation_progress || 0}%</p>
                            </div>
                            <Target className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Activation Progress */}
                {team.status !== 'active' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-blue-900">Team Activation Progress</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    {team.member_count}/20 members required for activation
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-32 bg-blue-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(team.member_count / 20) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-blue-900">
                                    {Math.round((team.member_count / 20) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'members'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Members
                            </button>
                            <button
                                onClick={() => setActiveTab('performance')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'performance'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Performance
                            </button>
                            <button
                                onClick={() => setActiveTab('hierarchy')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'hierarchy'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Hierarchy
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Statistics</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Active Members</span>
                                                <span className="text-sm font-medium">{stats?.active_members || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Inactive Members</span>
                                                <span className="text-sm font-medium">{stats?.inactive_members || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Average Investment</span>
                                                <span className="text-sm font-medium">₹{(stats?.average_investment || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Team Value</span>
                                                <span className="text-sm font-medium">₹{team.team_value.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                                        <div className="space-y-3">
                                            {team.team_members.slice(0, 5).map(member => (
                                                <div key={member.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {member.user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                                                            <p className="text-xs text-gray-500">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        member.user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        member.user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {member.user.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search members..."
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <Button variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredMembers?.map(member => (
                                                <tr key={member.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {member.user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                                                                <div className="text-sm text-gray-500">{member.user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            member.user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            member.user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {member.user.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {member.user.kyc_verified ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(member.joined_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{member.investment_amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'performance' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Trend</h3>
                                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Distribution</h3>
                                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <PieChart className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
                                    <div className="space-y-3">
                                        {team.team_members
                                            .sort((a, b) => b.investment_amount - a.investment_amount)
                                            .slice(0, 5)
                                            .map(member => (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {member.user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                                                            <p className="text-xs text-gray-500">{member.user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">₹{member.investment_amount.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">Total Investment</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'hierarchy' && (
                            <div className="space-y-4">
                                <div className="text-center py-12">
                                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                        <Activity className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600">Team hierarchy visualization coming soon</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Invite Team Members</h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={sendInvitation} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Invite Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setInviteData('invite_method', 'email')}
                                        className={`p-3 border rounded-lg text-center ${
                                            inviteData.invite_method === 'email' 
                                                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                                : 'border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        <Mail className="h-4 w-4 mx-auto mb-1" />
                                        <span className="text-xs">Email</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInviteData('invite_method', 'sms')}
                                        className={`p-3 border rounded-lg text-center ${
                                            inviteData.invite_method === 'sms' 
                                                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                                : 'border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        <MessageCircle className="h-4 w-4 mx-auto mb-1" />
                                        <span className="text-xs">SMS</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInviteData('invite_method', 'whatsapp')}
                                        className={`p-3 border rounded-lg text-center ${
                                            inviteData.invite_method === 'whatsapp' 
                                                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                                : 'border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        <Phone className="h-4 w-4 mx-auto mb-1" />
                                        <span className="text-xs">WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            {inviteData.invite_method === 'email' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter email address"
                                        value={inviteData.email}
                                        onChange={(e) => setInviteData('email', e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {(inviteData.invite_method === 'sms' || inviteData.invite_method === 'whatsapp') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter phone number"
                                        value={inviteData.phone}
                                        onChange={(e) => setInviteData('phone', e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add a personal message..."
                                    value={inviteData.message}
                                    onChange={(e) => setInviteData('message', e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" disabled={inviteProcessing}>
                                    {inviteProcessing ? 'Sending...' : 'Send Invitation'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
