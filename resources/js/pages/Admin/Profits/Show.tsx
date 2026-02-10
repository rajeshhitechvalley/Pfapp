import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    CheckCircle, 
    DollarSign, 
    User, 
    Calendar,
    Building,
    Target,
    FileText
} from 'lucide-react';

// Define route helper function
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    if (name === 'profits.index') return `${baseUrl}/admin/profits`;
    if (name === 'profits.edit') return `${baseUrl}/admin/profits/${params}/edit`;
    if (name === 'profits.show') return `${baseUrl}/admin/profits/${params}`;
    if (name === 'profits.distribute') return `${baseUrl}/admin/profits/${params}/distribute`;
    if (name === 'profits.destroy') return `${baseUrl}/admin/profits/${params}`;
    return `${baseUrl}/admin/${name}`;
};

interface ProfitUser {
    id: number;
    name: string;
    email: string;
}

interface ProfitInvestment {
    id: number;
    investment_type: string;
    amount: number;
    property?: {
        id: number;
        name: string;
    };
}

interface ProfitSale {
    id: number;
    sale_price: number;
    plot?: {
        id: number;
        plot_number: string;
        property?: {
            name: string;
        };
    };
}

interface ProfitData {
    id: number;
    user_id: number;
    investment_id: number;
    sale_id: number;
    total_profit: number;
    company_percentage: number;
    company_share: number;
    investor_share: number;
    profit_percentage: number;
    status: string;
    calculation_date: string;
    distribution_date: string;
    credit_date: string;
    notes: string;
    calculated_by: number;
    user: ProfitUser;
    investment?: ProfitInvestment;
    sale?: ProfitSale;
    created_at: string;
    updated_at: string;
}

interface ShowProfitProps {
    profit: ProfitData;
}

export default function ShowProfit({ profit }: ShowProfitProps) {
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'distributed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout title="Profit Details">
            <Head title={`Profit #${profit.id} - Admin`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={route('profits.index')} className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Profit Details</h2>
                                <p className="text-sm text-gray-600 mt-1">Profit record #{profit.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('profits.edit', profit.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                            {profit.status !== 'distributed' && (
                                <>
                                    <form
                                        method="POST"
                                        action={route('profits.distribute', profit.id)}
                                        className="inline"
                                        onSubmit={(e) => {
                                            if (!confirm('Are you sure you want to distribute this profit?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Distribute
                                        </button>
                                    </form>
                                    <form
                                        method="POST"
                                        action={route('profits.destroy', profit.id)}
                                        className="inline"
                                        onSubmit={(e) => {
                                            if (!confirm('Are you sure you want to delete this profit record?')) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <input type="hidden" name="_method" value="DELETE" />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profit Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(profit.total_profit)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <User className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Investor Share</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(profit.investor_share)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Building className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Company Share</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(profit.company_share)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Target className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Profit Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {profit.profit_percentage}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Profit ID</dt>
                                <dd className="text-sm text-gray-900">#{profit.id}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Status</dt>
                                <dd>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(profit.status)}`}>
                                        {profit.status?.toUpperCase()}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Company Percentage</dt>
                                <dd className="text-sm text-gray-900">{profit.company_percentage}%</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Profit Percentage</dt>
                                <dd className="text-sm text-gray-900">{profit.profit_percentage}%</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Created At</dt>
                                <dd className="text-sm text-gray-900">{formatDate(profit.created_at)}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* User Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">User</dt>
                                <dd className="text-sm text-gray-900">{profit.user.name}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Email</dt>
                                <dd className="text-sm text-gray-900">{profit.user.email}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">User ID</dt>
                                <dd className="text-sm text-gray-900">#{profit.user.id}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Related Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Related Information</h3>
                        <dl className="space-y-3">
                            {profit.investment ? (
                                <>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-600">Investment</dt>
                                        <dd className="text-sm text-gray-900">
                                            {profit.investment.investment_type} - {formatCurrency(profit.investment.amount)}
                                        </dd>
                                    </div>
                                    {profit.investment.property && (
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-600">Property</dt>
                                            <dd className="text-sm text-gray-900">{profit.investment.property.name}</dd>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex justify-between">
                                    <dt className="text-sm font-medium text-gray-600">Investment</dt>
                                    <dd className="text-sm text-gray-500">Not linked</dd>
                                </div>
                            )}
                            
                            {profit.sale ? (
                                <>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-600">Sale</dt>
                                        <dd className="text-sm text-gray-900">
                                            {formatCurrency(profit.sale.sale_price)}
                                        </dd>
                                    </div>
                                    {profit.sale.plot && (
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-600">Plot</dt>
                                            <dd className="text-sm text-gray-900">
                                                {profit.sale.plot.plot_number}
                                                {profit.sale.plot.property && ` - ${profit.sale.plot.property.name}`}
                                            </dd>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex justify-between">
                                    <dt className="text-sm font-medium text-gray-600">Sale</dt>
                                    <dd className="text-sm text-gray-500">Not linked</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Date Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Date Information</h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Calculation Date</dt>
                                <dd className="text-sm text-gray-900">{formatDate(profit.calculation_date)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Distribution Date</dt>
                                <dd className="text-sm text-gray-900">{formatDate(profit.distribution_date)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600">Credit Date</dt>
                                <dd className="text-sm text-gray-900">{formatDate(profit.credit_date)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Notes */}
                {profit.notes && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Notes
                        </h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{profit.notes}</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
