import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    Building,
    MapPin,
    Home,
    TrendingUp,
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
    Target,
    DollarSign,
    Calendar,
    Grid3x3,
    List,
    AlertTriangle,
    Settings,
    Plus
} from 'lucide-react';

interface PlotData {
    id: number;
    plot_number: string;
    area: number;
    price: number;
    status: string;
    property_project_id: number;
    created_at: string;
    updated_at: string;
    property?: {
        id: number;
        name: string;
        type: string;
        location: string;
    };
    sales?: {
        id: number;
        sale_price: number;
        sale_date: string;
        buyer: {
            id: number;
            name: string;
            email: string;
        };
    };
    investment?: {
        id: number;
        amount: number;
        investment_type: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

interface AdminPlotsProps {
    plots: PlotData[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export default function AdminPlots({ plots, pagination }: AdminPlotsProps) {
    const plotsArray = Array.isArray(plots) ? plots : [];

    return (
        <AdminLayout title="Plot Management">
            <Head title="Plots - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Plot Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage all property plots</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/admin/plots/features/create"
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Plot
                            </Link>
                            <Link
                                href="/admin/plots/features"
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Plot Features
                            </Link>
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
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
                                <Grid3x3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Plots</p>
                                <p className="text-2xl font-bold text-gray-900">{plotsArray.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Home className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available Plots</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {plotsArray.filter(plot => plot.status === 'available').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Sold Plots</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {plotsArray.filter(plot => plot.status === 'sold').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{plotsArray.reduce((sum, plot) => sum + plot.price, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search plots..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="reserved">Reserved</option>
                        </select>
                        <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Properties</option>
                        </select>
                        <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Sort by</option>
                            <option value="created_at">Created Date</option>
                            <option value="plot_number">Plot Number</option>
                            <option value="price">Price</option>
                        </select>
                    </div>
                </div>

                {/* Plots Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plot Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Property
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Area
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Investment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {plotsArray.map((plot) => (
                                    <tr key={plot.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <MapPin className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{plot.plot_number}</div>
                                                    <div className="text-xs text-gray-500">ID: #{plot.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{plot.property?.name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{plot.property?.type || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{plot.area} sq ft</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">₹{plot.price.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                plot.status === 'available' ? 'bg-green-100 text-green-800' :
                                                plot.status === 'sold' ? 'bg-red-100 text-red-800' :
                                                plot.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {plot.investment ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">₹{plot.investment.amount.toLocaleString()}</div>
                                                    <div className="text-xs text-gray-500">{plot.investment.user.name}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">No investment</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-900">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {plotsArray.length === 0 && (
                        <div className="text-center py-12">
                            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No plots found</h3>
                            <p className="text-gray-500">Get started by creating your first plot.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {pagination.from} to {pagination.to} of {pagination.total} results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                    disabled={pagination.current_page === 1}
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <button
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
