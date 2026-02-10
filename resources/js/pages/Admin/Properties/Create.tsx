import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
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
    Plus,
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
    approved_by: number;
    approved_at: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
}

interface AdminPropertyCreateProps {
    users: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
}

export default function AdminPropertyCreate({ users }: AdminPropertyCreateProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        location: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        type: 'land',
        total_area: '',
        total_plots: '',
        price_per_plot: '',
        purchase_cost: '',
        development_cost: '',
        legal_cost: '',
        marketing_cost: '',
        infrastructure_cost: '',
        expected_roi: '',
        projected_completion_date: '',
        status: 'planning',
        tsp_approved: false,
        government_approved: false,
        description: '',
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
            sold_plots: 0,
            total_area: parseFloat(data.total_area) || 0,
            price_per_plot: parseFloat(data.price_per_plot) || 0,
            total_value: totalValue,
            total_cost: totalCost,
            expected_roi: parseFloat(data.expected_roi) || 0,
            approved_by: 1, // Current admin user
            created_by: 1, // Current admin user
        };

        post('/admin/properties/store', {
            onSuccess: () => {
                router.visit('/admin/properties');
            },
            onError: (errors) => {
                console.error('Create failed:', errors);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Property" />
            
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
                            <h1 className="text-3xl font-bold text-gray-900">Create Property</h1>
                            <p className="text-gray-600 mt-1">Add a new property to the portfolio</p>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
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

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter city"
                                    required
                                />
                                {errors.city && (
                                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                    State
                                </label>
                                <input
                                    type="text"
                                    id="state"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter state"
                                    required
                                />
                                {errors.state && (
                                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter country"
                                    required
                                />
                                {errors.country && (
                                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="tsp_approved" className="block text-sm font-medium text-gray-700 mb-2">
                                        TSP Approved
                                    </label>
                                    <select
                                        id="tsp_approved"
                                        value={data.tsp_approved ? 'true' : 'false'}
                                        onChange={(e) => setData('tsp_approved', e.target.value === 'true')}
                                        className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                    {errors.tsp_approved && (
                                        <p className="mt-1 text-sm text-red-600">{errors.tsp_approved}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="government_approved" className="block text-sm font-medium text-gray-700 mb-2">
                                        Government Approved
                                    </label>
                                    <select
                                        id="government_approved"
                                        value={data.government_approved ? 'true' : 'false'}
                                        onChange={(e) => setData('government_approved', e.target.value === 'true')}
                                        className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                    {errors.government_approved && (
                                        <p className="mt-1 text-sm text-red-600">{errors.government_approved}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        {/* Calculated Values Display */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-800 mb-3">Calculated Values</h3>
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
                                href="/admin/properties"
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Creating...' : 'Create Property'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Shield className="h-6 w-6 text-blue-600 mt-1" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Property Creation Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Provide accurate property details including location and specifications</li>
                                    <li>Set realistic pricing based on market analysis and location</li>
                                    <li>Include all cost components for accurate ROI calculations</li>
                                    <li>Set appropriate approval status based on due diligence</li>
                                    <li>Projected completion date helps with planning and expectations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
