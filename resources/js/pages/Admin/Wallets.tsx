import { Head } from '@inertiajs/react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    DollarSign, 
    Wallet, 
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
    TrendingUp,
    BarChart3
} from 'lucide-react';

// Helper function to format currency with exactly 2 decimal places
const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === '') {
        return '₹0.00';
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
        return '₹0.00';
    }
    
    return `₹${numAmount.toFixed(2)}`;
};

// Helper function to format currency with thousands separator
const formatCurrencyWithSeparator = (amount: number | string | null | undefined): string => {
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

interface WalletData {
    id: number;
    balance: number;
    total_deposits: number;
    total_withdrawals: number;
    total_investments: number;
    frozen_amount: number;
    pending_amount: number;
    status: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

interface AdminWalletsProps {
    wallets: WalletData[];
}

export default function AdminWallets({ wallets }: AdminWalletsProps) {
    return (
        <AdminLayout title="Wallet Management">
            <Head title="Wallets - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Wallet Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage all user wallets and balances</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/admin/wallets/create"
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Wallet className="h-4 w-4 mr-2" />
                                Create Wallet
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
                                <Wallet className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Wallets</p>
                                <p className="text-2xl font-bold text-gray-900">{wallets.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(wallets.reduce((sum, wallet) => sum + wallet.balance, 0))}
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
                                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(wallets.reduce((sum, wallet) => sum + wallet.total_deposits, 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Investments</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(wallets.reduce((sum, wallet) => sum + wallet.total_investments, 0))}
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
                                placeholder="Search wallets..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="frozen">Frozen</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Balance Range</option>
                            <option value="0-1000">₹0 - ₹1,000</option>
                            <option value="1000-5000">₹1,000 - ₹5,000</option>
                            <option value="5000-10000">₹5,000 - ₹10,000</option>
                            <option value="10000+">₹10,000+</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Sort By</option>
                            <option value="created_at">Created Date</option>
                            <option value="balance">Balance</option>
                            <option value="total_deposits">Total Deposits</option>
                        </select>
                    </div>
                </div>

                {/* Wallets Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Wallet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {wallets.map((wallet) => (
                                    <tr key={wallet.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Wallet className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{formatCurrency(wallet.balance)}</div>
                                                    <div className="text-xs text-gray-500">ID: #{wallet.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{wallet.user.name}</div>
                                                    <div className="text-xs text-gray-500">{wallet.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="font-medium">{formatCurrency(wallet.total_deposits)}</div>
                                                <div className="text-xs text-gray-500">Deposits</div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formatCurrency(wallet.total_investments)} invested
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                wallet.status === 'active' ? 'bg-green-100 text-green-800' :
                                                wallet.status === 'frozen' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {wallet.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                {new Date(wallet.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/wallets/${wallet.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Wallet"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/wallets/${wallet.id}/edit`}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Edit Wallet"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete ${wallet.user.name}'s wallet? This action cannot be undone.`)) {
                                                            router.delete(`/admin/wallets/${wallet.id}`);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Wallet"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
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
