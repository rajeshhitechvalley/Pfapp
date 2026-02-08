import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Save,
    Building,
    MapPin,
    Home,
    Target,
    DollarSign,
    Calendar,
    Shield,
    X,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface PropertyData {
    id: number;
    name: string;
    location: string;
    address: string;
    type: string;
    total_area: number;
    total_plots: number;
    price_per_plot: number;
    purchase_cost: number;
    development_cost: number;
    legal_cost: number;
    marketing_cost: number;
    infrastructure_cost: number;
    expected_roi: number;
    projected_completion_date: string;
    status: string;
    tsp_approved: boolean;
    government_approved: boolean;
    description: string;
}

interface AdminPropertyEditProps {
    property: PropertyData;
    users: any[];
}

export default function AdminPropertyEdit({ property, users }: AdminPropertyEditProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: property.name,
        location: property.location,
        address: property.address || '',
        type: property.type,
        total_area: (property.total_area || 0).toString(),
        total_plots: (property.total_plots || 0).toString(),
        price_per_plot: (property.price_per_plot || 0).toString(),
        purchase_cost: (property.purchase_cost || 0).toString(),
        development_cost: (property.development_cost || 0).toString(),
        legal_cost: (property.legal_cost || 0).toString(),
        marketing_cost: (property.marketing_cost || 0).toString(),
        infrastructure_cost: (property.infrastructure_cost || 0).toString(),
        expected_roi: (property.expected_roi || 0).toString(),
        projected_completion_date: property.projected_completion_date || '',
        status: property.status,
        tsp_approved: property.tsp_approved || false,
        government_approved: property.government_approved || false,
        description: property.description || '',
    });

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

    const calculateTotals = () => {
        const totalPlots = parseInt(data.total_plots) || 0;
        const pricePerPlot = parseFloat(data.price_per_plot) || 0;
        const purchaseCost = parseFloat(data.purchase_cost) || 0;
        const developmentCost = parseFloat(data.development_cost) || 0;
        const legalCost = parseFloat(data.legal_cost) || 0;
        const marketingCost = parseFloat(data.marketing_cost) || 0;
        const infrastructureCost = parseFloat(data.infrastructure_cost) || 0;
        
        const totalValue = totalPlots * pricePerPlot;
        const totalCost = purchaseCost + developmentCost + legalCost + marketingCost + infrastructureCost;
        
        return { totalValue, totalCost };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const { totalValue, totalCost } = calculateTotals();
        
        const formData = {
            ...data,
            total_plots: parseInt(data.total_plots) || 0,
            available_plots: parseInt(data.total_plots) || 0,
            total_area: parseFloat(data.total_area) || 0,
            price_per_plot: parseFloat(data.price_per_plot) || 0,
            total_value: totalValue,
            total_cost: totalCost,
            expected_roi: parseFloat(data.expected_roi) || 0,
            updated_by: 1, // Current admin user
        };

        put(`/admin/properties/${property.id}/update`, {
            onSuccess: () => {
                router.visit(`/admin/properties/${property.id}`);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const handleDeleteProperty = () => {
        router.delete(`/admin/properties/${property.id}`, {
            onSuccess: () => {
                router.visit('/admin/properties');
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                setShowDeleteModal(false);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit Property - ${property.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={`/admin/properties/${property.id}`}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Property
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                            <p className="text-gray-600 mt-1">Update property information and details</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/properties/${property.id}`}
                            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            View Property
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Delete Property
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter property name"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Type
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="land">Land</option>
                                    <option value="resort">Resort</option>
                                    <option value="hotel">Hotel</option>
                                    <option value="farmhouse">Farmhouse</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="residential">Residential</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter location"
                                    required
                                />
                                {errors.location && (
                                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="total_area" className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Area (sq. ft.)
                                </label>
                                <input
                                    type="number"
                                    id="total_area"
                                    value={data.total_area}
                                    onChange={(e) => setData('total_area', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter total area"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                {errors.total_area && (
                                    <p className="mt-1 text-sm text-red-600">{errors.total_area}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="total_plots" className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Plots
                                </label>
                                <input
                                    type="number"
                                    id="total_plots"
                                    value={data.total_plots}
                                    onChange={(e) => setData('total_plots', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter total plots"
                                    min="1"
                                    required
                                />
                                {errors.total_plots && (
                                    <p className="mt-1 text-sm text-red-600">{errors.total_plots}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="price_per_plot" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price Per Plot (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="price_per_plot"
                                        value={data.price_per_plot}
                                        onChange={(e) => setData('price_per_plot', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                {errors.price_per_plot && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price_per_plot}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="development_cost" className="block text-sm font-medium text-gray-700 mb-2">
                                    Development Cost (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="development_cost"
                                        value={data.development_cost}
                                        onChange={(e) => setData('development_cost', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.development_cost && (
                                    <p className="mt-1 text-sm text-red-600">{errors.development_cost}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="legal_cost" className="block text-sm font-medium text-gray-700 mb-2">
                                    Legal Cost (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="legal_cost"
                                        value={data.legal_cost}
                                        onChange={(e) => setData('legal_cost', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.legal_cost && (
                                    <p className="mt-1 text-sm text-red-600">{errors.legal_cost}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="marketing_cost" className="block text-sm font-medium text-gray-700 mb-2">
                                    Marketing Cost (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="marketing_cost"
                                        value={data.marketing_cost}
                                        onChange={(e) => setData('marketing_cost', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.marketing_cost && (
                                    <p className="mt-1 text-sm text-red-600">{errors.marketing_cost}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="infrastructure_cost" className="block text-sm font-medium text-gray-700 mb-2">
                                    Infrastructure Cost (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="infrastructure_cost"
                                        value={data.infrastructure_cost}
                                        onChange={(e) => setData('infrastructure_cost', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.infrastructure_cost && (
                                    <p className="mt-1 text-sm text-red-600">{errors.infrastructure_cost}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="expected_roi" className="block text-sm font-medium text-gray-700 mb-2">
                                    Expected ROI (%)
                                </label>
                                <input
                                    type="number"
                                    id="expected_roi"
                                    value={data.expected_roi}
                                    onChange={(e) => setData('expected_roi', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter expected ROI"
                                    min="0"
                                    step="0.01"
                                />
                                {errors.expected_roi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.expected_roi}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="projected_completion_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Projected Completion Date
                                </label>
                                <input
                                    type="date"
                                    id="projected_completion_date"
                                    value={data.projected_completion_date}
                                    onChange={(e) => setData('projected_completion_date', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.projected_completion_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.projected_completion_date}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="planning">Planning</option>
                                    <option value="legal_approval">Legal Approval</option>
                                    <option value="development">Development</option>
                                    <option value="completed">Completed</option>
                                    <option value="sold">Sold</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="purchase_cost" className="block text-sm font-medium text-gray-700 mb-2">
                                    Purchase Cost (INR)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="purchase_cost"
                                        value={data.purchase_cost}
                                        onChange={(e) => setData('purchase_cost', e.target.value)}
                                        className="text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.purchase_cost && (
                                    <p className="mt-1 text-sm text-red-600">{errors.purchase_cost}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter property description"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    TSP Approved
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="tsp_approved"
                                        checked={data.tsp_approved}
                                        onChange={(e) => setData('tsp_approved', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="tsp_approved" className="text-sm text-gray-700">
                                        Check if TSP approval is granted
                                    </label>
                                </div>
                                {errors.tsp_approved && (
                                    <p className="mt-1 text-sm text-red-600">{errors.tsp_approved}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Government Approved
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="government_approved"
                                        checked={data.government_approved}
                                        onChange={(e) => setData('government_approved', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="government_approved" className="text-sm text-gray-700">
                                        Check if government approval is granted
                                    </label>
                                </div>
                                {errors.government_approved && (
                                    <p className="mt-1 text-sm text-red-600">{errors.government_approved}</p>
                                )}
                            </div>
                        </div>

                        {/* Calculated Values Display */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-800 mb-3">Updated Calculated Values</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Total Value</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculateTotals().totalValue)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total Cost</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculateTotals().totalCost)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Link
                                href={`/admin/properties/${property.id}`}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-blue-600 mt-1" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Property Editing Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Be careful when changing plot counts as it affects available inventory</li>
                                    <li>Price changes will affect the total property value calculation</li>
                                    <li>Status changes should be made with proper verification</li>
                                    <li>Cost adjustments impact ROI calculations and profitability</li>
                                    <li>Always provide clear descriptions for audit trails</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Property</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Are you sure you want to delete this property? This action cannot be undone and will remove all associated data.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProperty}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete Property
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
