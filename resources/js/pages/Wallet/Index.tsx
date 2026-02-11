import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Wallet, Plus, Download, Eye, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

interface WalletProps {
    wallet: {
        id: number;
        balance: number;
        total_deposits: number;
        total_withdrawals: number;
        total_investments: number;
        status: string;
    };
    transactions: Array<{
        id: number;
        type: string;
        amount: number;
        status: string;
        description: string;
        created_at: string;
    }>;
}

export default function WalletIndex({ wallet, transactions }: WalletProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Wallet" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
                                    <p className="mt-2 text-gray-600">Manage your funds and transactions</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link 
                                        href="/wallet/deposit"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Deposit
                                    </Link>
                                    <Link 
                                        href="/wallet/withdraw"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <ArrowUpRight className="h-4 w-4 mr-2" />
                                        Withdraw
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Balance Card */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100">Current Balance</p>
                                        <h2 className="text-3xl font-bold mt-2">{formatCurrency(wallet.balance)}</h2>
                                    </div>
                                    <Wallet className="h-12 w-12 text-blue-200" />
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-green-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <ArrowDownRight className="h-8 w-8 text-green-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Total Deposits</h3>
                                            <p className="text-2xl font-bold text-green-600">{formatCurrency(wallet.total_deposits)}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-red-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <ArrowUpRight className="h-8 w-8 text-red-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Total Withdrawals</h3>
                                            <p className="text-2xl font-bold text-red-600">{formatCurrency(wallet.total_withdrawals)}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <CreditCard className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Investments</h3>
                                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(wallet.total_investments)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                    <Link 
                                        href="/wallet/history"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                    >
                                        View All
                                        <Eye className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                                
                                {transactions.length > 0 ? (
                                    <div className="space-y-3">
                                        {transactions.slice(0, 5).map((transaction) => (
                                            <div key={transaction.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                                                    }`}>
                                                        {transaction.type === 'deposit' ? (
                                                            <ArrowDownRight className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                                                        <p className="text-sm text-gray-500">{transaction.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${
                                                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(transaction.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>No transactions yet</p>
                                        <p className="text-sm mt-2">Start by depositing funds to your wallet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
