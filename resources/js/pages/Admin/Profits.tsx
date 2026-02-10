import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    DollarSign, 
    TrendingUp, 
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Building,
    Target,
    BarChart3,
    Plus
} from 'lucide-react';
import { useState } from 'react';

// Define route helper function
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    if (name === 'profits.create') return `${baseUrl}/admin/profits/create`;
    if (name === 'profits.show') return `${baseUrl}/admin/profits/${params}`;
    if (name === 'profits.edit') return `${baseUrl}/admin/profits/${params}/edit`;
    if (name === 'profits.index') return `${baseUrl}/admin/profits`;
    return `${baseUrl}/admin/${name}`;
};

interface ProfitData {
    id: number;
    user_id: number;
    investment_id: number;
    sale_id: number;
    investor_share: number;
    company_share: number;
    total_profit: number;
    profit_percentage: number;
    company_percentage: number;
    status: string;
    distribution_date: string;
    calculation_date: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    investment?: {
        id: number;
        investment_type: string;
    };
    sale?: {
        id: number;
        sale_price: number;
    };
    created_at: string;
    updated_at: string;
}

interface AdminProfitsProps {
    profits: ProfitData[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export default function AdminProfits({ profits, pagination }: AdminProfitsProps) {
    const profitsArray = Array.isArray(profits) ? profits : [];
    const [selectedProfits, setSelectedProfits] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProfits(profitsArray.map(profit => profit.id));
        } else {
            setSelectedProfits([]);
        }
    };

    const handleSelectProfit = (profitId: number, checked: boolean) => {
        if (checked) {
            setSelectedProfits([...selectedProfits, profitId]);
        } else {
            setSelectedProfits(selectedProfits.filter(id => id !== profitId));
        }
    };

    const handleDistributeBulk = () => {
        if (selectedProfits.length === 0) {
            alert('Please select at least one profit to distribute.');
            return;
        }

        if (confirm(`Are you sure you want to distribute ${selectedProfits.length} profit(s)?`)) {
            router.post('/admin/profits/distribute-bulk', {
                profit_ids: selectedProfits
            }, {
                onSuccess: () => setSelectedProfits([]),
            });
        }
    };

    const handleDelete = (profitId: number) => {
        if (confirm('Are you sure you want to delete this profit record?')) {
            router.delete(`/admin/profits/${profitId}`);
        }
    };

    const handleDistribute = (profitId: number) => {
        if (confirm('Are you sure you want to distribute this profit?')) {
            router.post(`/admin/profits/${profitId}/distribute`);
        }
    };

    const filteredProfits = profitsArray.filter(profit => {
        const matchesSearch = profit.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            profit.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            profit.id.toString().includes(searchTerm);
        const matchesStatus = !statusFilter || profit.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout title="Profit Management">
            <Head title="Profits - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Profit Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage profit distribution and calculations</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('profits.create')}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Profit
                            </Link>
                            {selectedProfits.length > 0 && (
                                <button
                                    onClick={handleDistributeBulk}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Distribute Selected ({selectedProfits.length})
                                </button>
                            )}
                            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Profits</p>
                                <p className="text-2xl font-bold text-gray-900">{profitsArray.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Distributed</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{profitsArray.reduce((sum, profit) => sum + profit.investor_share, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Company Share</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{profitsArray.reduce((sum, profit) => sum + profit.company_share, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Target className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Avg Profit Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {profitsArray.length > 0 ? (profitsArray.reduce((sum, profit) => sum + profit.profit_percentage, 0) / profitsArray.length).toFixed(2) : '0'}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search profits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="distributed">Distributed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Date Range</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>

                {/* Profits Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedProfits.length === filteredProfits.length && filteredProfits.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Profit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Investor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Investment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Investor Share
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Company Share
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Distribution Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProfits.map((profit) => (
                                    <tr key={profit.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedProfits.includes(profit.id)}
                                                onChange={(e) => handleSelectProfit(profit.id, e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">₹{profit.total_profit.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">ID: #{profit.id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{profit.user.name}</div>
                                                    <div className="text-xs text-gray-500">{profit.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {profit.investment?.investment_type || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ₹{profit.investor_share.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ₹{profit.company_share.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {profit.profit_percentage}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                profit.status === 'distributed' ? 'bg-green-100 text-green-800' :
                                                profit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {profit.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                {profit.distribution_date ? new Date(profit.distribution_date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={route('profits.show', profit.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route('profits.edit', profit.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                {profit.status !== 'distributed' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleDistribute(profit.id)}
                                                            className="text-purple-600 hover:text-purple-900"
                                                            title="Distribute"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(profit.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
