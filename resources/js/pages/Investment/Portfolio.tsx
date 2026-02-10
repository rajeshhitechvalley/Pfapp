import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { TrendingUp, TrendingDown, DollarSign, Building, Calendar, Target, ArrowLeft, PieChart, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';

interface Investment {
    id: number;
    amount: number;
    investment_type: string;
    status: string;
    investment_date: string;
    expected_return?: number;
    actual_return?: number;
    return_rate?: number;
    maturity_date?: string;
    property?: {
        name: string;
        location: string;
        type: string;
    };
    plot?: {
        plot_number: string;
        area: number;
        area_unit: string;
        price: number;
    };
}

interface PortfolioStats {
    total_invested: number;
    total_returns: number;
    net_profit: number;
    total_investments: number;
    active_investments: number;
    completed_investments: number;
    average_roi: number;
}

interface PortfolioProps {
    investments: Investment[];
    portfolioStats: PortfolioStats;
    projectAllocation: any[];
    plotAllocation: any[];
    timeline: any[];
}

export default function InvestmentPortfolio({ 
    investments, 
    portfolioStats, 
    projectAllocation, 
    plotAllocation, 
    timeline 
}: PortfolioProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'active': return 'text-green-600 bg-green-50';
            case 'completed': return 'text-blue-600 bg-blue-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const calculateROI = (investment: Investment) => {
        if (!investment.actual_return || !investment.amount) return 0;
        return ((investment.actual_return - investment.amount) / investment.amount) * 100;
    };

    const getProfitLoss = (investment: Investment) => {
        if (!investment.actual_return) return 0;
        return investment.actual_return - investment.amount;
    };

    return (
        <AppLayout>
            <Head title="Investment Portfolio" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link 
                                        href="/investment"
                                        className="mr-4 text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>
                                        <p className="mt-2 text-gray-600">Detailed view of your investment holdings</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                                        <PieChart className="h-4 w-4 mr-2" />
                                        Portfolio Analysis
                                    </button>
                                    <Link 
                                        href="/investment/create"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Investment
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Portfolio Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <DollarSign className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Total Portfolio Value</h3>
                                            <p className="text-2xl font-bold text-blue-600">
                                                ${portfolioStats.total_invested.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`rounded-lg p-6 ${portfolioStats.net_profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex items-center">
                                        {portfolioStats.net_profit >= 0 ? (
                                            <TrendingUp className="h-8 w-8 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-8 w-8 text-red-600" />
                                        )}
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Total Gains</h3>
                                            <p className={`text-2xl font-bold ${portfolioStats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${Math.abs(portfolioStats.net_profit).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <Target className="h-8 w-8 text-purple-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Active Investments</h3>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {portfolioStats.active_investments}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <Calendar className="h-8 w-8 text-yellow-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Avg. Return Rate</h3>
                                            <p className="text-2xl font-bold text-yellow-600">
                                                {portfolioStats.average_roi.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Asset Allocation</h3>
                                        <PieChart className="h-5 w-5 text-gray-400" />
                                    </div>
                                    {projectAllocation.length > 0 ? (
                                        <div className="space-y-3">
                                            {projectAllocation.map((allocation, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">{allocation.project?.name}</span>
                                                    <div className="flex items-center">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                            <div 
                                                                className="bg-blue-600 h-2 rounded-full" 
                                                                style={{ width: `${allocation.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm">{allocation.percentage.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <PieChart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p>No investment data available</p>
                                            <p className="text-sm mt-2">Start investing to see your portfolio allocation</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
                                        <BarChart3 className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="text-center py-8 text-gray-500">
                                        <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>No performance data available</p>
                                        <p className="text-sm mt-2">Your investment performance will appear here</p>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Holdings */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Investment Holdings</h3>
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Export
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Print
                                        </button>
                                    </div>
                                </div>
                                
                                {investments.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Investment
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Amount Invested
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Current Value
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Returns
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
                                                {investments.map((investment) => (
                                                    <tr key={investment.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <Link 
                                                                    href={`/investment/${investment.id}`}
                                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                                >
                                                                    #{investment.id}
                                                                </Link>
                                                                <div className="text-sm text-gray-500">
                                                                    {investment.property?.name || investment.plot?.plot_number}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm capitalize">
                                                                {investment.investment_type.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium">
                                                                ${investment.amount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium">
                                                                ${investment.actual_return?.toLocaleString() || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {getProfitLoss(investment) >= 0 ? (
                                                                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                                ) : (
                                                                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                                                )}
                                                                <span className={`text-sm font-medium ${getProfitLoss(investment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    ${Math.abs(getProfitLoss(investment)).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(investment.status)}`}>
                                                                {investment.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex space-x-2">
                                                                <Link 
                                                                    href={`/investment/${investment.id}`}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                                {investment.status === 'pending' && (
                                                                    <button className="text-red-600 hover:text-red-900">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Building className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>No investment holdings yet</p>
                                        <p className="text-sm mt-2">Create your first investment to see it here</p>
                                        <Link 
                                            href="/investment/create"
                                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create First Investment
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Link 
                                        href="/investment/create"
                                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                    >
                                        Add Investment
                                    </Link>
                                    <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center">
                                        Rebalance Portfolio
                                    </button>
                                    <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center">
                                        Generate Report
                                    </button>
                                    <Link 
                                        href="/investment"
                                        className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
                                    >
                                        Back to Investments
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
