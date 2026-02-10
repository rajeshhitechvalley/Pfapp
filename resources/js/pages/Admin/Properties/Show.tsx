import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    ArrowLeft,
    Building,
    MapPin,
    Home,
    Target,
    DollarSign,
    Calendar,
    Shield,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Eye,
    TrendingUp,
    Users,
    FileText,
    AlertTriangle,
    X
} from 'lucide-react';

interface PropertyData {
    id: number;
    name: string;
    location: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    type: string;
    total_area: number;
    total_plots: number;
    available_plots: number;
    sold_plots: number;
    price_per_plot: number;
    total_value: number;
    development_cost: number;
    legal_cost: number;
    marketing_cost: number;
    infrastructure_cost: number;
    total_cost: number;
    expected_roi: number;
    projected_completion_date: string;
    actual_completion_date: string;
    status: string;
    approval_status: string;
    legal_approval_status: string;
    government_approval_status: string;
    tsp_approval_status: string;
    approved_by: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    created_by: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    updated_by: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    created_at: string;
    updated_at: string;
}

interface AdminPropertyShowProps {
    property: PropertyData;
}

export default function AdminPropertyShow({ property }: AdminPropertyShowProps) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'under_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPropertyTypeIcon = (type: string) => {
        switch (type) {
            case 'land':
                return <MapPin className="h-5 w-5" />;
            case 'resort':
                return <Building className="h-5 w-5" />;
            case 'hotel':
                return <Home className="h-5 w-5" />;
            case 'farmhouse':
                return <Home className="h-5 w-5" />;
            case 'commercial':
                return <Building className="h-5 w-5" />;
            case 'residential':
                return <Home className="h-5 w-5" />;
            default:
                return <Building className="h-5 w-5" />;
        }
    };

    return (
        <AdminLayout>
            <Head title={`Property Details - ${property.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/admin/properties"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Properties
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Property Details</h1>
                            <p className="text-gray-600 mt-1">View property information and management</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Property
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this property? This action cannot be undone and will remove all associated data.')) {
                                    router.delete(`/admin/properties/${property.id}`);
                                }
                            }}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Property
                        </button>
                    </div>
                </div>

                {/* Property Overview */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    {getPropertyTypeIcon(property.type)}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {property.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {property.type?.charAt(0).toUpperCase() + property.type?.slice(1)} - {property.location}
                                    </p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                                {property.status?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className={`h-5 w-5 mr-2 text-blue-600`}>
                                        {getPropertyTypeIcon(property.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Plots</p>
                                        <p className="text-2xl font-bold text-gray-900">{property.total_plots}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="h-5 w-5 mr-2 text-green-600">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Available Plots</p>
                                        <p className="text-2xl font-bold text-gray-900">{property.available_plots}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="h-5 w-5 mr-2 text-red-600">
                                        <X className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Sold Plots</p>
                                        <p className="text-2xl font-bold text-gray-900">{property.sold_plots}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="h-5 w-5 mr-2 text-blue-600">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Price Per Plot</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(property.price_per_plot)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Total Area</p>
                                <p className="text-lg font-semibold text-gray-900">{property.total_area} sq. ft.</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Value</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(property.total_value)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Expected ROI</p>
                                <p className="text-lg font-semibold text-gray-900">{property.expected_roi}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Property Details */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {property.address || 'Not specified'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Location Details</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {property.city}, {property.state}, {property.country}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Pincode: {property.pincode || 'Not specified'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                                        {property.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Approval Status</p>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApprovalStatusColor(property.approval_status)}`}>
                                        {property.approval_status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Legal Approval</p>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApprovalStatusColor(property.legal_approval_status)}`}>
                                        {property.legal_approval_status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Government Approval</p>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApprovalStatusColor(property.government_approval_status)}`}>
                                        {property.government_approval_status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Created By</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {property.created_by?.name || 'System'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created At</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {new Date(property.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Information */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Financial Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Price Per Plot</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(property.price_per_plot)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Value</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(property.total_value)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Development Cost</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(property.development_cost)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Legal Cost</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(property.legal_cost)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Marketing Cost</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(property.marketing_cost)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Infrastructure Cost</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(property.infrastructure_cost)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Total Cost</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {formatCurrency(property.total_cost)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Expected ROI</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {property.expected_roi}%
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div>
                                <p className="text-sm text-gray-600">Projected Completion</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {property.projected_completion_date ? new Date(property.projected_completion_date).toLocaleDateString() : 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Actual Completion</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {property.actual_completion_date ? new Date(property.actual_completion_date).toLocaleDateString() : 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-900">Timeline</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Created</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(property.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(property.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            
                            {property.approved_by && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <Shield className="h-5 w-5 text-blue-600 mt-1" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Approved By</p>
                                        <p className="text-sm text-gray-500">
                                            {property.approved_by?.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/admin/properties/${property.id}/edit`}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Property
                            </Link>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this property? This action cannot be undone and will remove all associated data.')) {
                                        router.delete(`/admin/properties/${property.id}`);
                                    }
                                }}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Property
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
