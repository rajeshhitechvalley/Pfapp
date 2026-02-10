import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { ArrowLeft, Save, X } from 'lucide-react';

// Define route helper function
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    if (name === 'profits.store') return `${baseUrl}/admin/profits`;
    if (name === 'profits.index') return `${baseUrl}/admin/profits`;
    return `${baseUrl}/admin/${name}`;
};

interface User {
    id: number;
    name: string;
    email: string;
}

interface Investment {
    id: number;
    investment_type: string;
    amount: number;
    user: User;
    property?: {
        id: number;
        name: string;
    };
}

interface Sale {
    id: number;
    sale_price: number;
    user: User;
    plot?: {
        id: number;
        plot_number: string;
        property?: {
            name: string;
        };
    };
}

interface CreateProfitProps {
    users: User[];
    investments: Investment[];
    sales: Sale[];
}

export default function CreateProfit({ users, investments, sales }: CreateProfitProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        investment_id: '',
        sale_id: '',
        total_profit: '',
        company_percentage: '20',
        profit_percentage: '',
        status: 'pending',
        calculation_date: '',
        distribution_date: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profits.store'), {
            onSuccess: () => reset(),
        });
    };

    const calculateShares = () => {
        if (data.total_profit && data.company_percentage) {
            const total = parseFloat(data.total_profit);
            const companyPercent = parseFloat(data.company_percentage);
            const companyShare = total * (companyPercent / 100);
            const investorShare = total - companyShare;
            
            return {
                companyShare: companyShare.toFixed(2),
                investorShare: investorShare.toFixed(2),
            };
        }
        return { companyShare: '0.00', investorShare: '0.00' };
    };

    const shares = calculateShares();

    return (
        <AdminLayout title="Create Profit">
            <Head title="Create Profit - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={route('profits.index')} className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Create Profit Record</h2>
                                <p className="text-sm text-gray-600 mt-1">Add a new profit distribution record</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User *
                                </label>
                                <select
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select User</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                )}
                            </div>

                            {/* Investment Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Investment (Optional)
                                </label>
                                <select
                                    value={data.investment_id}
                                    onChange={(e) => setData('investment_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Investment</option>
                                    {investments.map((investment) => (
                                        <option key={investment.id} value={investment.id}>
                                            {investment.user.name} - {investment.investment_type} - ₹{investment.amount.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                {errors.investment_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.investment_id}</p>
                                )}
                            </div>

                            {/* Sale Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sale (Optional)
                                </label>
                                <select
                                    value={data.sale_id}
                                    onChange={(e) => setData('sale_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Sale</option>
                                    {sales.map((sale) => (
                                        <option key={sale.id} value={sale.id}>
                                            {sale.user.name} - Plot {sale.plot?.plot_number || 'N/A'} - ₹{sale.sale_price.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                {errors.sale_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sale_id}</p>
                                )}
                            </div>

                            {/* Total Profit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Profit *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.total_profit}
                                    onChange={(e) => setData('total_profit', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.total_profit && (
                                    <p className="mt-1 text-sm text-red-600">{errors.total_profit}</p>
                                )}
                            </div>

                            {/* Company Percentage */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={data.company_percentage}
                                    onChange={(e) => setData('company_percentage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="20.00"
                                />
                                {errors.company_percentage && (
                                    <p className="mt-1 text-sm text-red-600">{errors.company_percentage}</p>
                                )}
                            </div>

                            {/* Profit Percentage */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profit Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={data.profit_percentage}
                                    onChange={(e) => setData('profit_percentage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                />
                                {errors.profit_percentage && (
                                    <p className="mt-1 text-sm text-red-600">{errors.profit_percentage}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="distributed">Distributed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            {/* Calculation Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Calculation Date *
                                </label>
                                <input
                                    type="date"
                                    value={data.calculation_date}
                                    onChange={(e) => setData('calculation_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.calculation_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.calculation_date}</p>
                                )}
                            </div>

                            {/* Distribution Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Distribution Date
                                </label>
                                <input
                                    type="date"
                                    value={data.distribution_date}
                                    onChange={(e) => setData('distribution_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.distribution_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.distribution_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Calculated Shares Preview */}
                        {data.total_profit && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Calculated Shares</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Company Share:</span>
                                        <span className="ml-2 text-sm font-medium">₹{parseFloat(shares.companyShare).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Investor Share:</span>
                                        <span className="ml-2 text-sm font-medium">₹{parseFloat(shares.investorShare).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add any notes about this profit record..."
                            />
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href={route('profits.index')}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Creating...' : 'Create Profit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
