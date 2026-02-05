import { Head } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
    TrendingUp, 
    DollarSign, 
    Users, 
    Home, 
    PieChart, 
    BarChart3,
    Wallet,
    Target,
    Activity,
    Calendar,
    Award,
    Eye,
    ArrowUp,
    ArrowDown,
    Star,
    Clock,
    CheckCircle,
    AlertTriangle,
    UserCheck,
    Building,
    MapPin,
    FileText,
    Settings
} from 'lucide-react';

interface DashboardStats {
    total_invested: number;
    total_returns: number;
    net_profit: number;
    roi_percentage: number;
    investment_count: number;
    active_investments: number;
    completed_investments: number;
}

interface Eligibility {
    can_invest: boolean;
    has_active_investments: boolean;
    kyc_verified: boolean;
    team_active: boolean;
    team_value_met: boolean;
    wallet_balance: number;
    min_investment_met: boolean;
}

interface PlotComparison {
    user_plots_count: number;
    user_avg_price: number;
    market_avg_price: number;
    price_difference: number;
    price_difference_percentage: number;
}

interface ProfitSummary {
    total_investor_profits: number;
    total_company_profits: number;
    total_profits: number;
    avg_profit: number;
    max_profit: number;
    total_invested: number;
    overall_roi: number;
}

interface QuickAction {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    href: string;
}

export default function UserDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data - in real app, this would come from props
    const stats: DashboardStats = {
        total_invested: 250000,
        total_returns: 27500,
        net_profit: 2500,
        roi_percentage: 11.0,
        investment_count: 5,
        active_investments: 3,
        completed_investments: 2,
    };

    const eligibility: Eligibility = {
        can_invest: true,
        has_active_investments: true,
        kyc_verified: true,
        team_active: true,
        team_value_met: true,
        wallet_balance: 15000,
        min_investment_met: true,
    };

    const plotComparison: PlotComparison = {
        user_plots_count: 3,
        user_avg_price: 85000,
        market_avg_price: 90000,
        price_difference: 5000,
        price_difference_percentage: 5.56,
    };

    const profitSummary: ProfitSummary = {
        total_investor_profits: 27500,
        total_company_profits: 2750,
        total_profits: 30250,
        avg_profit: 5500,
        max_profit: 12000,
        total_invested: 250000,
        overall_roi: 11.0,
    };

    const quickActions: QuickAction[] = [
        {
            title: 'Invest in New Project',
            description: 'Browse available investment opportunities',
            icon: <Target className="h-5 w-5" />,
            color: 'blue',
            href: '/projects',
        },
        {
            title: 'View Wallet Details',
            description: 'Check your balance and transactions',
            icon: <Wallet className="h-5 w-5" />,
            color: 'green',
            href: '/dashboard/wallet',
        },
        {
            title: 'Team Management',
            description: 'Manage your team members',
            icon: <Users className="h-5 w-5" />,
            color: 'purple',
            href: '/dashboard/team',
        },
        {
            title: 'Complete KYC',
            description: 'Verify your identity for full access',
            icon: <UserCheck className="h-5 w-5" />,
            color: 'yellow',
            href: '/dashboard/profile',
        },
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'investment',
            description: 'Invested in Green Valley Project',
            amount: 50000,
            date: '2024-01-15',
            status: 'active',
        },
        {
            id: 2,
            type: 'profit',
            description: 'Received profit from Downtown Project',
            amount: 5500,
            date: '2024-01-10',
            status: 'completed',
        },
        {
            id: 3,
            type: 'investment',
            description: 'Invested in Beach Resort Project',
            amount: 75000,
            date: '2024-01-05',
            status: 'active',
        },
        {
            id: 4,
            type: 'transaction',
            description: 'Wallet deposit',
            amount: 25000,
            date: '2024-01-03',
            status: 'completed',
        },
    ];

    const availableProjects = [
        {
            id: 1,
            name: 'Green Valley Residential',
            type: 'residential',
            location: 'Mumbai, Maharashtra',
            total_plots: 50,
            available_plots: 12,
            price_per_plot: 85000,
            status: 'active',
            image: '/images/projects/residential.jpg',
        },
        {
            id: 2,
            name: 'Beach Resort',
            type: 'resort',
            location: 'Goa, Karnataka',
            total_plots: 30,
            available_plots: 8,
            price_per_plot: 120000,
            status: 'active',
            image: '/images/projects/resort.jpg',
        },
        {
            id: 3,
            name: 'Downtown Commercial Complex',
            type: 'commercial',
            location: 'Bangalore, Karnataka',
            total_plots: 100,
            available_plots: 25,
            price_per_plot: 150000,
            status: 'active',
            image: '/images/projects/commercial.jpg',
        },
    ];

    const availablePlots = [
        {
            id: 1,
            plot_number: 'GV-001',
            area: 500,
            price: 85000,
            property: 'Green Valley Residential',
            location: 'Mumbai, Maharashtra',
            status: 'available',
        },
        {
            id: 2,
            plot_number: 'GV-002',
            area: 450,
            price: 85000,
            property: 'Green Valley Residential',
            location: 'Mumbai, Maharashtra',
            status: 'available',
        },
        {
            id: 3,
            plot_number: 'BR-001',
            area: 600,
            price: 120000,
            property: 'Beach Resort',
            location: 'Goa, Karnataka',
            status: 'available',
        },
        {
            id: 4,
            plot_number: 'BR-002',
            area: 750,
            price: 120000,
            property: 'Beach Resort',
            location: 'Goa, Karnataka',
            status: 'available',
        },
    ];

    return (
        <>
            <Head title="Dashboard - Property Investment" />
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center">
                                    <Home className="h-8 w-8" />
                                    <h1 className="text-2xl font-bold">Property Investment Dashboard</h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm">Welcome back, {stats.user?.name || 'Investor'}</span>
                                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                                        <Settings className="h-4 w-4 inline-block mr-2" />
                                        Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'overview'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('investments')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'investments'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Investments
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('projects')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'projects'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Projects
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('plots')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'plots'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Plots
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('profits')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'profits'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Profits
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Stats Cards */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="p-3 bg-blue-100 rounded-full">
                                                <DollarSign className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                                                <p className="text-2xl font-bold text-gray-900">₹{stats.total_invested.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="p-3 bg-green-100 rounded-full">
                                                <TrendingUp className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                                                <p className="text-2xl font-bold text-gray-900">₹{stats.total_returns.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="p-3 bg-purple-100 rounded-full">
                                                <PieChart className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                                                <p className="text-2xl font-bold text-gray-900">₹{stats.net_profit.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Eligibility Indicators */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Eligibility</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {eligibility.can_invest && (
                                            <div className="flex items-center p-4 bg-green-50 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-green-800">Can Invest</p>
                                                    <p className="text-sm text-green-600">You meet all requirements</p>
                                                </div>
                                            </div>
                                        )}
                                        {!eligibility.can_invest && (
                                            <div className="flex items-center p-4 bg-red-50 rounded-lg">
                                                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-red-800">Cannot Invest</p>
                                                    <p className="text-sm text-red-600">Check requirements</p>
                                                </div>
                                            </div>
                                        )}
                                        {eligibility.kyc_verified && (
                                            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                                                <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-blue-800">KYC Verified</p>
                                                    <p className="text-sm text-blue-600">Identity verified</p>
                                                </div>
                                            </div>
                                        )}
                                        {!eligibility.kyc_verified && (
                                            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                                                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-yellow-800">KYC Pending</p>
                                                    <p className="text-sm text-yellow-600">Verification required</p>
                                                </div>
                                            </div>
                                        )}
                                        {eligibility.team_active && (
                                            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                                                <Users className="h-5 w-5 text-purple-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-purple-800">Team Active</p>
                                                    <p className="text-sm text-purple-600">Team meets requirements</p>
                                                </div>
                                            </div>
                                        )}
                                        {eligibility.min_investment_met && (
                                            <div className="flex items-center p-4 bg-green-50 rounded-lg">
                                                <Wallet className="h-5 w-5 text-green-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-green-800">Sufficient Balance</p>
                                                    <p className="text-sm text-green-600">₹{eligibility.wallet_balance.toLocaleString()} available</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {quickActions.map((action, index) => (
                                            <a
                                                key={index}
                                                href={action.href}
                                                className={`flex items-center p-4 rounded-lg border-2 border-${action.color}-200 hover:border-${action.color}-300 transition-colors duration-200`}
                                            >
                                                <div className="flex-shrink-0">
                                                    {action.icon}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-medium text-gray-900">{action.title}</p>
                                                    <p className="text-sm text-gray-600">{action.description}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                        <a href="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-800">View All</a>
                                    </div>
                                    <div className="space-y-4">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-full ${
                                                        activity.type === 'investment' ? 'bg-blue-100' :
                                                        activity.type === 'profit' ? 'bg-green-100' :
                                                        'bg-gray-100'
                                                    }`}>
                                                        {activity.type === 'investment' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                                                        {activity.type === 'profit' && <DollarSign className="h-4 w-4 text-green-600" />}
                                                        {activity.type === 'transaction' && <Activity className="h-4 w-4 text-gray-600" />}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="font-medium text-gray-900">{activity.description}</p>
                                                        <p className="text-sm text-gray-600">{activity.date}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Status: <span className={`font-medium ${
                                                                activity.status === 'active' ? 'text-green-600' :
                                                                activity.status === 'completed' ? 'text-blue-600' :
                                                                'text-gray-600'
                                                            }`}>{activity.status}</span>
                                                        </p>
                                                    </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">₹{activity.amount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {activeTab === 'investments' && (
                            <div className="space-y-6">
                                {/* Investment Stats */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Performance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{stats.investment_count}</p>
                                            <p className="text-sm text-gray-600">Total Investments</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{stats.active_investments}</p>
                                            <p className="text-sm text-gray-600">Active</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">{stats.completed_investments}</p>
                                            <p className="text-sm text-gray-600">Completed</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">{stats.roi_percentage}%</p>
                                            <p className="text-sm text-gray-600">Avg ROI</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Available Projects */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Projects</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {availableProjects.map((project) => (
                                            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                                                <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                                                    <img 
                                                        src={project.image} 
                                                        alt={project.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">{project.type} • {project.location}</p>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">{project.available_plots}</span> / {project.total_plots} plots available
                                                            </p>
                                                            <p className="text-xs text-gray-500">₹{project.price_per_plot.toLocaleString()} per plot</p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Plot Comparison */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Plot Price Comparison</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">{plotComparison.user_plots_count}</p>
                                                <p className="text-sm text-gray-600">Your Plots</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900">₹{plotComparison.user_avg_price.toLocaleString()}</p>
                                                <p className="text-sm text-gray-600">Avg Price</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900">₹{plotComparison.market_avg_price.toLocaleString()}</p>
                                                <p className="text-sm text-gray-600">Market Avg</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600">Price Difference</p>
                                                <div className="flex items-center">
                                                    <ArrowUp className="h-4 w-4 text-green-600 mr-2" />
                                                    <span className="text-lg font-bold text-green-600">₹{plotComparison.price_difference.toLocaleString()}</span>
                                                    <span className="text-sm text-gray-600"> ({plotComparison.price_difference_percentage}%)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {activeTab === 'plots' && (
                            <div className="space-y-6">
                                {/* Available Plots */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Available Plots</h3>
                                        <a href="/dashboard/projects" className="text-sm text-blue-600 hover:text-blue-800">View All Projects</a>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {availablePlots.map((plot) => (
                                            <div key={plot.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-900">{plot.plot_number}</h4>
                                                            <p className="text-sm text-gray-600">{plot.property.name}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            plot.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {plot.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                            <p className="text-sm text-gray-600">Area</p>
                                                            <p className="font-medium text-gray-900">{plot.area} sq ft</p>
                                                        </div>
                                                    <div>
                                                            <p className="text-sm text-gray-600">Price</p>
                                                            <p className="font-medium text-gray-900">₹{plot.price.toLocaleString()}</p>
                                                        </div>
                                                </div>
                                                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                                    Invest in Plot
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profits' && (
                            <div className="space-y-6">
                                {/* Profit Summary */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Return Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">₹{profitSummary.total_investor_profits.toLocaleString()}</p>
                                            <p className="text-sm text-gray-600">Investor Profits</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">₹{profitSummary.total_company_profits.toLocaleString()}</p>
                                            <p className="text-sm text-gray-600">Company Profits</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">{profitSummary.total_profits}</p>
                                            <p className="text-sm text-gray-600">Total Profits</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">{profitSummary.avg_profit.toLocaleString()}</p>
                                            <p className="text-sm text-gray-600">Avg Profit</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-orange-600">₹{profitSummary.max_profit.toLocaleString()}</p>
                                            <p className="text-sm text-gray-600">Max Profit</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ROI Performance */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Invested</p>
                                                <p className="text-lg font-bold text-gray-900">₹{profitSummary.total_invested.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Overall ROI</p>
                                                <p className="text-2xl font-bold text-green-600">{profitSummary.overall_roi}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
