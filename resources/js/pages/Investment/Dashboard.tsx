import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    TrendingUp, 
    DollarSign, 
    Calendar, 
    PieChart, 
    BarChart3,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    Building,
    MapPin,
    Target,
    Shield,
    FileText,
    Mail,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Investment {
    id: number;
    investment_id: string;
    amount: number;
    investment_type: string;
    status: string;
    investment_date: string;
    approval_date?: string;
    expected_return: number;
    actual_return?: number;
    return_rate: number;
    maturity_date: string;
    property?: {
        id: number;
        name: string;
        type: string;
        location: string;
    };
    plot?: {
        id: number;
        plot_number: string;
        area: number;
        price: number;
    };
    plot_holdings?: Array<{
        id: number;
        plot: {
            plot_number: string;
            area: number;
        };
        amount_invested: number;
        percentage_owned: number;
    }>;
    auto_reinvest: boolean;
    reinvest_percentage?: number;
    investment_tier: string;
    risk_level: string;
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

interface ProjectAllocation {
    project: {
        id: number;
        name: string;
        type: string;
    };
    total_invested: number;
    investment_count: number;
    percentage: number;
}

interface PlotAllocation {
    plot: {
        id: number;
        plot_number: string;
        area: number;
    };
    total_invested: number;
    holding_count: number;
    percentage_owned: number;
}

const InvestmentDashboard: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
    const [projectAllocation, setProjectAllocation] = useState<ProjectAllocation[]>([]);
    const [plotAllocation, setPlotAllocation] = useState<PlotAllocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        project_id: '',
        search: ''
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReinvestModal, setShowReinvestModal] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

    useEffect(() => {
        fetchInvestmentData();
    }, []);

    const fetchInvestmentData = async () => {
        try {
            setLoading(true);
            
            // Fetch investments
            const investmentsResponse = await fetch('/investment?all=true');
            const investmentsData = await investmentsResponse.json();
            
            if (investmentsData.success) {
                setInvestments(investmentsData.data.investments.data);
                setPortfolioStats(investmentsData.data.stats);
            }

            // Fetch portfolio data
            const portfolioResponse = await fetch('/investment/portfolio');
            const portfolioData = await portfolioResponse.json();
            
            if (portfolioData.success) {
                setProjectAllocation(portfolioData.data.project_allocation);
                setPlotAllocation(portfolioData.data.plot_allocation);
            }
        } catch (error) {
            console.error('Failed to fetch investment data:', error);
            toast.error('Failed to load investment data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvestment = () => {
        setShowCreateModal(true);
    };

    const handleReinvest = (investment: Investment) => {
        setSelectedInvestment(investment);
        setShowReinvestModal(true);
    };

    const handleViewDetails = (investmentId: number) => {
        router.visit(`/investment/${investmentId}`);
    };

    const handleDownloadReceipt = async (investmentId: number) => {
        try {
            const response = await fetch(`/investment/${investmentId}/receipt`, {
                method: 'GET',
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `investment-receipt-${investmentId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Receipt downloaded successfully');
            } else {
                toast.error('Failed to download receipt');
            }
        } catch (error) {
            console.error('Error downloading receipt:', error);
            toast.error('Failed to download receipt');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending_approval':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            case 'pending_approval':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'high':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading investment data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Investment Dashboard" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Investment Dashboard</h1>
                                <p className="mt-2 text-gray-600">Manage your investment portfolio and track returns</p>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleCreateInvestment}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Investment
                                </button>
                                <button
                                    onClick={fetchInvestmentData}
                                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Stats */}
                    {portfolioStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Invested</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(portfolioStats.total_invested)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Returns</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(portfolioStats.total_returns)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Target className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Net Profit</p>
                                        <p className={`text-2xl font-bold ${portfolioStats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(portfolioStats.net_profit)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Average ROI</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {portfolioStats.average_roi.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Project and Plot Allocation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Project Allocation */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Allocation</h3>
                            <div className="space-y-3">
                                {projectAllocation.map((allocation, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{allocation.project.name}</p>
                                                <p className="text-xs text-gray-500">{allocation.project.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(allocation.total_invested)}
                                            </p>
                                            <p className="text-xs text-gray-500">{allocation.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Plot Allocation */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plot Allocation</h3>
                            <div className="space-y-3">
                                {plotAllocation.slice(0, 5).map((allocation, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{allocation.plot.plot_number}</p>
                                                <p className="text-xs text-gray-500">{allocation.plot.area} sq.ft</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(allocation.total_invested)}
                                            </p>
                                            <p className="text-xs text-gray-500">{allocation.percentage_owned.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Investments Table */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Your Investments</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search investments..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        />
                                    </div>
                                    <select
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Investment ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Return Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expected Return
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Maturity Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {investments.map((investment) => (
                                        <tr key={investment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {investment.investment_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    {investment.investment_type === 'project' && <Building className="w-4 h-4 mr-1" />}
                                                    {investment.investment_type === 'plot' && <MapPin className="w-4 h-4 mr-1" />}
                                                    {investment.investment_type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(investment.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                                                    {getStatusIcon(investment.status)}
                                                    <span className="ml-1">{investment.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {investment.return_rate}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(investment.expected_return)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(investment.maturity_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(investment.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {investment.status === 'completed' && investment.actual_return! > 0 && (
                                                        <button
                                                            onClick={() => handleReinvest(investment)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Reinvest"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDownloadReceipt(investment.id)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Download Receipt"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {investments.length === 0 && (
                            <div className="text-center py-12">
                                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
                                <p className="text-gray-500 mb-4">Start investing to build your portfolio</p>
                                <button
                                    onClick={handleCreateInvestment}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Investment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Investment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Create New Investment</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Investment creation form will be implemented here with project/plot selection and amount input.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Investment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reinvest Modal */}
            {showReinvestModal && selectedInvestment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Reinvest Returns</h2>
                            <button
                                onClick={() => setShowReinvestModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">
                                Available returns from investment {selectedInvestment.investment_id}:
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(selectedInvestment.actual_return || 0)}
                            </p>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Reinvestment form will be implemented here with amount selection and project/plot allocation.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowReinvestModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowReinvestModal(false)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Reinvest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InvestmentDashboard;
