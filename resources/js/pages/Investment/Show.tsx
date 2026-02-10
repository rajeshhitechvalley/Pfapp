import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Calendar,
    Target,
    Building,
    ArrowLeft,
    Edit,
    Trash2,
    Download,
    RefreshCw
} from 'lucide-react';

interface Investment {
    id: number;
    amount: number;
    investment_type: string;
    status: string;
    investment_date: string;
    approval_date?: string;
    expected_return?: number;
    actual_return?: number;
    return_rate?: number;
    maturity_date?: string;
    notes?: string;
    user: {
        name: string;
        email: string;
    };
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

export default function InvestmentShow({ investment }: { investment: Investment }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleReinvest = () => {
        router.post(`/investment/${investment.id}/reinvest`, {}, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: () => {
                // Handle success
            }
        });
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this investment?')) {
            router.put(`/investment/${investment.id}/cancel`, {
                reason: 'User requested cancellation'
            }, {
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
                onSuccess: () => {
                    router.visit('/investment');
                }
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'active': return 'text-green-600 bg-green-50';
            case 'completed': return 'text-blue-600 bg-blue-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const calculateROI = () => {
        if (!investment.actual_return || !investment.amount) return 0;
        return ((investment.actual_return - investment.amount) / investment.amount) * 100;
    };

    const getProfitLoss = () => {
        if (!investment.actual_return) return 0;
        return investment.actual_return - investment.amount;
    };

    return (
        <AppLayout>
            <Head title={`Investment #${investment.id}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Header */}
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
                                        <h1 className="text-2xl font-bold text-gray-900">Investment #{investment.id}</h1>
                                        <p className="text-sm text-gray-600">
                                            {new Date(investment.investment_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleReinvest}
                                        disabled={isLoading || investment.status !== 'completed'}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reinvest
                                    </button>
                                    <Link 
                                        href={`/investment/${investment.id}/receipt`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Receipt
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Investment Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <DollarSign className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Invested Amount</h3>
                                            <p className="text-2xl font-bold text-blue-600">
                                                ${investment.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`rounded-lg p-6 ${getProfitLoss() >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex items-center">
                                        {getProfitLoss() >= 0 ? (
                                            <TrendingUp className="h-8 w-8 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-8 w-8 text-red-600" />
                                        )}
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Profit/Loss</h3>
                                            <p className={`text-2xl font-bold ${getProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${Math.abs(getProfitLoss()).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <Target className="h-8 w-8 text-purple-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">ROI</h3>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {calculateROI().toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <Calendar className="h-8 w-8 text-yellow-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Maturity Date</h3>
                                            <p className="text-lg font-bold text-yellow-600">
                                                {investment.maturity_date ? new Date(investment.maturity_date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Basic Information */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h3>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-600">Investment Type</dt>
                                            <dd className="text-sm font-medium text-gray-900 capitalize">
                                                {investment.investment_type.replace('_', ' ')}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-600">Status</dt>
                                            <dd className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(investment.status)}`}>
                                                {investment.status.replace('_', ' ')}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-600">Investment Date</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {new Date(investment.investment_date).toLocaleDateString()}
                                            </dd>
                                        </div>
                                        {investment.approval_date && (
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-600">Approval Date</dt>
                                                <dd className="text-sm font-medium text-gray-900">
                                                    {new Date(investment.approval_date).toLocaleDateString()}
                                                </dd>
                                            </div>
                                        )}
                                        {investment.return_rate && (
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-600">Expected Return Rate</dt>
                                                <dd className="text-sm font-medium text-gray-900">
                                                    {investment.return_rate}%
                                                </dd>
                                            </div>
                                        )}
                                        {investment.expected_return && (
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-600">Expected Return</dt>
                                                <dd className="text-sm font-medium text-gray-900">
                                                    ${investment.expected_return.toLocaleString()}
                                                </dd>
                                            </div>
                                        )}
                                        {investment.actual_return && (
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-600">Actual Return</dt>
                                                <dd className="text-sm font-medium text-gray-900">
                                                    ${investment.actual_return.toLocaleString()}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                {/* Investment Asset */}
                                {(investment.property || investment.plot) && (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Asset</h3>
                                        {investment.property && (
                                            <dl className="space-y-3 mb-4">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Project</dt>
                                                    <dd className="text-sm font-medium text-gray-900">
                                                        {investment.property.name}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Location</dt>
                                                    <dd className="text-sm font-medium text-gray-900">
                                                        {investment.property.location}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Type</dt>
                                                    <dd className="text-sm font-medium text-gray-900 capitalize">
                                                        {investment.property.type}
                                                    </dd>
                                                </div>
                                            </dl>
                                        )}
                                        {investment.plot && (
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Plot Number</dt>
                                                    <dd className="text-sm font-medium text-gray-900">
                                                        {investment.plot.plot_number}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Area</dt>
                                                    <dd className="text-sm font-medium text-gray-900">
                                                        {investment.plot.area} {investment.plot.area_unit}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-600">Plot Price</dt>
                                                    <dd className="text-sm font-medium text-gray-900">
                                                        ${investment.plot.price.toLocaleString()}
                                                    </dd>
                                                </div>
                                            </dl>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {investment.notes && (
                                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {investment.notes}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end space-x-4">
                                {investment.status === 'pending' && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Cancel Investment
                                    </button>
                                )}
                                <Link 
                                    href="/investment"
                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Back to Investments
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
