import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    Building, 
    Target, 
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
    MapPin,
    Home,
    TrendingUp,
    DollarSign
} from 'lucide-react';

interface PropertyData {
    id: number;
    name: string;
    location: string;
    type: string;
    status: string;
    total_plots: number;
    available_plots: number;
    sold_plots: number;
    total_investment: number;
    created_at: string;
    updated_at: string;
}

interface AdminPropertiesProps {
    properties: PropertyData[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export default function AdminProperties({ properties, pagination }: AdminPropertiesProps) {
    const propertiesArray = Array.isArray(properties) ? properties : [];

    // Helper function to format currency
    const formatCurrency = (amount: number | string | null | undefined): string => {
        if (amount === null || amount === undefined || amount === '') {
            return '₹0.00';
        }
        
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (isNaN(numAmount)) {
            return '₹0.00';
        }
        
        return `₹${numAmount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };
    return (
        <AdminLayout title="Property Management">
            <Head title="Properties - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Property Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage all property projects</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/admin/properties/create"
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Building className="h-4 w-4 mr-2" />
                                New Property
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
                                <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                                <p className="text-2xl font-bold text-gray-900">{propertiesArray.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Target className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Plots</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {propertiesArray.reduce((sum, prop) => sum + prop.total_plots, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{propertiesArray.reduce((sum, prop) => sum + prop.total_investment, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Home className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available Plots</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {properties.reduce((sum, prop) => sum + prop.available_plots, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search properties..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="completed">Completed</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Property Type</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="mixed">Mixed Use</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Sort By</option>
                            <option value="created_at">Created Date</option>
                            <option value="name">Name</option>
                            <option value="total_plots">Total Plots</option>
                        </select>
                    </div>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                            {/* Property Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                                            <Building className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold text-white">{property.name}</h3>
                                            <p className="text-sm text-blue-100">{property.type?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        property.status === 'active' ? 'bg-green-100 text-green-800' :
                                        property.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {property.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Property Info */}
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Location</p>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                            {property.location}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Total Plots</p>
                                        <p className="text-lg font-semibold text-gray-900">{property.total_plots}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Available Plots</p>
                                        <p className="text-lg font-semibold text-green-600">{property.available_plots}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Sold Plots</p>
                                        <p className="text-lg font-semibold text-red-600">{property.sold_plots}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Total Investment</p>
                                        <p className="text-lg font-semibold text-blue-600">{formatCurrency(property.total_investment)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-gray-200 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Created {new Date(property.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/admin/properties/${property.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="View Property"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={`/admin/properties/${property.id}/edit`}
                                            className="text-green-600 hover:text-green-900"
                                            title="Edit Property"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this property? This action cannot be undone and will remove all associated data.')) {
                                                    router.delete(`/admin/properties/${property.id}`);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Property"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
