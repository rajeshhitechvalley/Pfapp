import { Head } from '@inertiajs/react';
import { useState } from 'react';
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
    Plus,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Grid3x3,
    List,
    AlertTriangle
} from 'lucide-react';

interface PlotData {
    id: number;
    plot_number: string;
    area: number;
    area_unit: string;
    price: number;
    price_per_sqft?: number;
    plot_type: string;
    road_facing: boolean;
    status: string;
    description?: string;
    features?: string[];
    dimensions?: string;
    length?: number;
    width?: number;
    location_details?: string;
    facing_direction?: string;
    road_width?: number;
    corner_plot: boolean;
    double_road: boolean;
    location_coordinates?: string;
    nearby_amenities?: string[];
    soil_type?: string;
    topography?: string;
    legal_clearance?: string;
    development_charges?: number;
    maintenance_charges?: number;
    water_connection: boolean;
    electricity_connection: boolean;
    sewage_connection: boolean;
    gas_connection: boolean;
    internet_connection: boolean;
    road_access?: string;
    tags?: string[];
    priority_level?: number;
    featured_plot: boolean;
    original_price?: number;
    discount_percentage?: number;
    special_offer: boolean;
    offer_expiry_date?: string;
    negotiable: boolean;
    created_at: string;
    updated_at: string;
    property?: {
        id: number;
        name: string;
        type: string;
        location: string;
    };
}

interface PlotFeaturesProps {
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

export default function PlotFeaturesIndex({ plots, pagination }: PlotFeaturesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'held': return 'bg-orange-100 text-orange-800';
            case 'sold': return 'bg-red-100 text-red-800';
            case 'reserved': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return <CheckCircle className="w-4 h-4" />;
            case 'held': return <Clock className="w-4 h-4" />;
            case 'sold': return <XCircle className="w-4 h-4" />;
            case 'reserved': return <AlertTriangle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const filteredPlots = plots.filter(plot =>
        plot.plot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.plot_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="Plot Features" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Plot Features</h1>
                        <p className="text-gray-600">Manage plot features and specifications</p>
                    </div>
                    <a
                        href="/admin/plots/features/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Plot
                    </a>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search plots..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700 hover:text-gray-900"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                            <div className="flex border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'} text-gray-700 hover:text-gray-900`}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'} text-gray-700 hover:text-gray-900`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Plots</p>
                                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                            </div>
                            <Building className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {plots.filter(p => p.status === 'available').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Held</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {plots.filter(p => p.status === 'held').length}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sold</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {plots.filter(p => p.status === 'sold').length}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Plots Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlots.map((plot) => (
                            <div key={plot.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{plot.plot_number}</h3>
                                            <p className="text-sm text-gray-600">{plot.property?.name}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(plot.status)}`}>
                                            {getStatusIcon(plot.status)}
                                            {plot.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Area:</span>
                                            <span className="font-medium text-gray-900">{plot.area} {plot.area_unit}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Price:</span>
                                            <span className="font-medium text-gray-900">{formatPrice(plot.price)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Type:</span>
                                            <span className="font-medium text-gray-900 capitalize">{plot.plot_type}</span>
                                        </div>
                                        {plot.facing_direction && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Facing:</span>
                                                <span className="font-medium text-gray-900">{plot.facing_direction}</span>
                                            </div>
                                        )}
                                        {plot.corner_plot && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Corner:</span>
                                                <span className="font-medium text-green-600">Yes</span>
                                            </div>
                                        )}
                                        {plot.double_road && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Double Road:</span>
                                                <span className="font-medium text-green-600">Yes</span>
                                            </div>
                                        )}
                                    </div>

                                    {plot.features && plot.features.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-600 mb-1">Features:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {plot.features.slice(0, 3).map((feature, index) => (
                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                        {feature}
                                                    </span>
                                                ))}
                                                {plot.features.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                                        +{plot.features.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <a
                                            href={`/admin/plots/features/${plot.id}/edit`}
                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                                        >
                                            <Edit className="w-3 h-3" />
                                            Edit
                                        </a>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (confirm('Are you sure you want to delete this plot?')) {
                                                    fetch(`/admin/plots/features/${plot.id}`, {
                                                        method: 'DELETE',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                                        }
                                                    })
                                                    .then(response => {
                                                        if (response.ok) {
                                                            window.location.reload();
                                                        } else {
                                                            alert('Error deleting plot');
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.error('Error:', error);
                                                        alert('Error deleting plot');
                                                    });
                                                }
                                            }}
                                            className="flex-1"
                                        >
                                            <button
                                                type="submit"
                                                className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Plot Details
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
                                            Type
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
                                    {filteredPlots.map((plot) => (
                                        <tr key={plot.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{plot.plot_number}</div>
                                                    {plot.corner_plot && (
                                                        <span className="text-xs text-green-600">Corner Plot</span>
                                                    )}
                                                    {plot.double_road && (
                                                        <span className="text-xs text-blue-600 ml-2">Double Road</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {plot.property?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {plot.area} {plot.area_unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatPrice(plot.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="capitalize">{plot.plot_type}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(plot.status)}`}>
                                                    {plot.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <a
                                                        href={`/admin/plots/features/${plot.id}/edit`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </a>
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            if (confirm('Are you sure you want to delete this plot?')) {
                                                                fetch(`/admin/plots/features/${plot.id}`, {
                                                                    method: 'DELETE',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                                                    }
                                                                })
                                                                .then(response => {
                                                                    if (response.ok) {
                                                                        window.location.reload();
                                                                    } else {
                                                                        alert('Error deleting plot');
                                                                    }
                                                                })
                                                                .catch(error => {
                                                                    console.error('Error:', error);
                                                                    alert('Error deleting plot');
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Showing {pagination.from} to {pagination.to} of {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.current_page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
