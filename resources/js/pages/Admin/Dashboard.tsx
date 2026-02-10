import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    Users, 
    Users2, 
    TrendingUp, 
    DollarSign, 
    Home, 
    PieChart, 
    FileText, 
    Settings,
    BarChart3,
    IndianRupee,
    Target,
    Activity,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

interface DashboardStats {
    total_users: number;
    active_users: number;
    pending_users: number;
    total_teams: number;
    active_teams: number;
    pending_teams: number;
    total_investments: number;
    total_invested_amount: number;
    total_wallet_balance: number;
    total_properties: number;
    total_plots: number;
    available_plots: number;
    sold_plots: number;
    total_sales: number;
    total_sales_amount: number;
    total_profits: number;
    total_company_profit: number;
}

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
    };
    created_at: string;
}

interface Investment {
    id: number;
    amount: number;
    investment_type: string;
    status: string;
    user: {
        name: string;
        email: string;
    };
    property?: {
        name: string;
    };
    plot?: {
        plot_number: string;
    };
    created_at: string;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    status: string;
    user: {
        name: string;
        email: string;
    };
    created_at: string;
}

interface Sale {
    id: number;
    sale_price: number;
    profit_amount: number;
    buyer_name: string;
    plot: {
        plot_number: string;
        property: {
            name: string;
        };
    };
    created_at: string;
}

interface MonthlyStats {
    month: string;
    users: number;
    investments: number;
    sales: number;
    profits: number;
}

interface AdminDashboardProps {
    stats: DashboardStats;
    recentUsers: User[];
    recentInvestments: Investment[];
    recentTransactions: Transaction[];
    recentSales: Sale[];
    monthlyStats: MonthlyStats[];
    topInvestors: any[];
    topTeams: any[];
    propertyPerformance: any[];
}

export default function AdminDashboard({ 
    stats, 
    recentUsers, 
    recentInvestments, 
    recentTransactions, 
    recentSales, 
    monthlyStats,
    topInvestors,
    topTeams,
    propertyPerformance 
}: AdminDashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const StatCard = ({ title, value, icon: Icon, change, changeType }: {
        title: string;
        value: string | number;
        icon: any;
        change?: number;
        changeType?: 'up' | 'down';
    }) => (
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                                {change !== undefined && (
                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                                        changeType === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {changeType === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        {Math.abs(change)}%
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Admin Dashboard">
            <Head title="Admin Dashboard" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-2 text-gray-600">Property Investment Management System Overview</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Users"
                            value={stats.total_users}
                            icon={Users}
                            change={stats.active_users > 0 ? Math.round((stats.active_users / stats.total_users) * 100) : 0}
                            changeType="up"
                        />
                        <StatCard
                            title="Active Teams"
                            value={`${stats.active_teams}/${stats.total_teams}`}
                            icon={Users2}
                            change={stats.total_teams > 0 ? Math.round((stats.active_teams / stats.total_teams) * 100) : 0}
                            changeType="up"
                        />
                        <StatCard
                            title="Total Investments"
                            value={formatCurrency(stats.total_invested_amount)}
                            icon={TrendingUp}
                        />
                        <StatCard
                            title="Total Sales"
                            value={formatCurrency(stats.total_sales_amount)}
                            icon={DollarSign}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Available Plots"
                            value={stats.available_plots}
                            icon={Home}
                        />
                        <StatCard
                            title="Sold Plots"
                            value={stats.sold_plots}
                            icon={Target}
                        />
                        <StatCard
                            title="Total Profits"
                            value={formatCurrency(stats.total_profits)}
                            icon={PieChart}
                        />
                        <StatCard
                            title="Company Profit"
                            value={formatCurrency(stats.total_company_profit)}
                            icon={IndianRupee}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Monthly Statistics */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Statistics</h3>
                            <div className="space-y-4">
                                {monthlyStats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">{stat.month}</div>
                                            <div className="text-xs text-gray-500">
                                                Users: {stat.users} | Investments: {formatCurrency(stat.investments)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-green-600">Sales: {formatCurrency(stat.sales)}</div>
                                            <div className="text-xs text-gray-500">Profits: {formatCurrency(stat.profits)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href="/admin/users"
                                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <Users className="h-6 w-6 text-blue-500 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium">Manage Users</div>
                                        <div className="text-xs text-gray-500">{stats.pending_users} pending</div>
                                    </div>
                                </a>
                                <a
                                    href="/admin/teams"
                                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <Users2 className="h-6 w-6 text-green-500 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium">Manage Teams</div>
                                        <div className="text-xs text-gray-500">{stats.pending_teams} pending</div>
                                    </div>
                                </a>
                                <a
                                    href="/admin/investments"
                                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <TrendingUp className="h-6 w-6 text-purple-500 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium">Investments</div>
                                        <div className="text-xs text-gray-500">{stats.total_investments} total</div>
                                    </div>
                                </a>
                                <a
                                    href="/admin/reports"
                                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <BarChart3 className="h-6 w-6 text-orange-500 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium">Reports</div>
                                        <div className="text-xs text-gray-500">View analytics</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Recent Users */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {recentUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <Users className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`px-2 py-1 text-xs rounded-full ${
                                                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {user.status}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {formatCurrency(user.registration_fee_paid)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Investments */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Investments</h3>
                                <div className="space-y-3">
                                    {recentInvestments.map((investment) => (
                                        <div key={investment.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{investment.user.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {investment.property?.name || investment.plot?.plot_number || 'General'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(investment.amount)}
                                                </div>
                                                <div className={`px-2 py-1 text-xs rounded-full ${
                                                    investment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {investment.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions and Sales */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Transactions */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                                <div className="space-y-3">
                                    {recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                        transaction.type === 'deposit' ? 'bg-green-100' :
                                                        transaction.type === 'withdrawal' ? 'bg-red-100' :
                                                        transaction.type === 'investment' ? 'bg-blue-100' :
                                                        'bg-purple-100'
                                                    }`}>
                                                        <Activity className={`h-4 w-4 ${
                                                            transaction.type === 'deposit' ? 'text-green-600' :
                                                            transaction.type === 'withdrawal' ? 'text-red-600' :
                                                            transaction.type === 'investment' ? 'text-blue-600' :
                                                            'text-purple-600'
                                                        }`} />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{transaction.user.name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{transaction.type}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(transaction.amount)}
                                                </div>
                                                <div className={`px-2 py-1 text-xs rounded-full ${
                                                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {transaction.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Sales */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sales</h3>
                                <div className="space-y-3">
                                    {recentSales.map((sale) => (
                                        <div key={sale.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <DollarSign className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{sale.buyer_name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {sale.plot.property.name} - Plot {sale.plot.plot_number}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(sale.sale_price)}
                                                </div>
                                                <div className="text-xs text-green-600">
                                                    Profit: {formatCurrency(sale.profit_amount)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
