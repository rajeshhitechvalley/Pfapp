import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    TrendingUp, 
    DollarSign, 
    Home, 
    MapPin, 
    Users, 
    Wallet,
    Building,
    Calendar,
    Bell,
    Target,
    Activity,
    ArrowUp,
    ArrowDown,
    Eye,
    Clock,
    CheckCircle,
    AlertTriangle,
    LogOut
} from 'lucide-react';

interface DashboardStats {
    total_investments?: number;
    total_invested_amount?: number;
    available_plots?: number;
    held_plots?: number;
    team_members?: number;
    wallet_balance?: number;
    pending_actions?: number;
    recent_activities?: number;
}

interface Project {
    id: number;
    name: string;
    location: string;
    total_plots: number;
    available_plots: number;
    status: string;
}

interface Plot {
    id: number;
    plot_number: string;
    project_name: string;
    area: number;
    area_unit: string;
    price: number;
    status: string;
}

interface WalletData {
    balance?: number;
    pending_deposits?: number;
    pending_withdrawals?: number;
    last_transaction?: string;
}

interface InvestmentData {
    total_invested?: number;
    active_investments?: number;
    pending_investments?: number;
    returns?: number;
    roi_percentage?: number;
}

interface TeamData {
    total_members?: number;
    active_members?: number;
    team_value?: number;
    max_hold_amount?: number;
    used_hold_amount?: number;
    hold_limit_status?: string;
}

interface Activity {
    id: number;
    type: string;
    title: string;
    description: string;
    amount?: number;
    created_at: string;
    icon: string;
    color: string;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface Eligibility {
    can_invest?: boolean;
    can_hold_plots?: boolean;
    max_plots_allowed?: number;
    current_plots_held?: number;
    investment_limit?: number;
    team_value_required?: number;
    reasons?: string[];
}

interface Preferences {
    theme?: string;
    notifications?: boolean;
    email_alerts?: boolean;
    sms_alerts?: boolean;
    dashboard_layout?: string;
}

interface UserDashboardProps {
    stats: DashboardStats;
    projects: Project[];
    plots: Plot[];
    wallet: WalletData;
    investment: InvestmentData;
    team: TeamData;
    activities: Activity[];
    notifications: Notification[];
    eligibility: Eligibility;
    preferences: Preferences;
}

export default function UserDashboard({
    stats,
    projects,
    plots,
    wallet,
    investment,
    team,
    activities,
    notifications,
    eligibility,
    preferences
}: UserDashboardProps) {
    const unreadNotifications = (notifications || []).filter(n => !n.read_at);
    const eligibilityReasons = eligibility?.reasons || [];

    const handleLogout = () => {
        router.post('/auth/logout', {}, {
            onFinish: () => {
                router.visit('/');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back! Here's your investment overview.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link 
                            href="/notifications"
                            className="relative p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                            <Bell className="w-5 h-5 text-gray-600" />
                            {unreadNotifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadNotifications.length}
                                </span>
                            )}
                        </Link>
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Investment</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${(investment?.total_invested || 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-green-600 mt-1">
                                    ROI: {investment?.roi_percentage || 0}%
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Wallet Balance</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${(wallet?.balance || 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Available funds
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Wallet className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Available Plots</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.available_plots || 0}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {stats?.held_plots || 0} held
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Team Members</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {team?.active_members || 0}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {team?.total_members || 0} total
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Eligibility Status */}
                {eligibility && !eligibility.can_invest && eligibilityReasons.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-yellow-800">Investment Requirements</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    {eligibilityReasons.join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activities */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {(activities || []).length > 0 ? (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`bg-${activity.color}-100 p-2 rounded-lg`}>
                                                {activity.icon === 'dollar-sign' && <DollarSign className={`w-4 h-4 text-${activity.color}-600`} />}
                                                {activity.icon === 'map-pin' && <MapPin className={`w-4 h-4 text-${activity.color}-600`} />}
                                                {activity.icon === 'users' && <Users className={`w-4 h-4 text-${activity.color}-600`} />}
                                                {activity.icon === 'activity' && <Activity className={`w-4 h-4 text-${activity.color}-600`} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                <p className="text-sm text-gray-600">{activity.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {activity.amount && (
                                                <p className="text-sm font-medium text-gray-900">${activity.amount.toLocaleString()}</p>
                                            )}
                                            <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No recent activities</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <Link 
                                href="/plots"
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">Browse Plots</span>
                                </div>
                                <ArrowUp className="w-4 h-4 text-gray-400 rotate-45" />
                            </Link>
                            
                            <Link 
                                href="/investments/create"
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">New Investment</span>
                                </div>
                                <ArrowUp className="w-4 h-4 text-gray-400 rotate-45" />
                            </Link>
                            
                            <Link 
                                href="/wallet"
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <Wallet className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">Manage Wallet</span>
                                </div>
                                <ArrowUp className="w-4 h-4 text-gray-400 rotate-45" />
                            </Link>
                            
                            <Link 
                                href="/team"
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <Users className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">Team Management</span>
                                </div>
                                <ArrowUp className="w-4 h-4 text-gray-400 rotate-45" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Available Projects */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Available Projects</h2>
                            <Link 
                                href="/projects"
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(projects || []).slice(0, 6).map((project) => (
                                <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            project.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{project.location}</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            {project.available_plots} / {project.total_plots} plots
                                        </span>
                                        <Link 
                                            href={`/projects/${project.id}`}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
