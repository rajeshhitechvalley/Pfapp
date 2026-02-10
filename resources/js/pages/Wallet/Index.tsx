import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Wallet, Plus, Download, Eye, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

export default function WalletIndex() {
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
                                        <h2 className="text-3xl font-bold mt-2">$0.00</h2>
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
                                            <p className="text-2xl font-bold text-green-600">$0.00</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-red-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <ArrowUpRight className="h-8 w-8 text-red-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Total Withdrawals</h3>
                                            <p className="text-2xl font-bold text-red-600">$0.00</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <CreditCard className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Investments</h3>
                                            <p className="text-2xl font-bold text-blue-600">$0.00</p>
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
                                
                                <div className="text-center py-8 text-gray-500">
                                    <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>No transactions yet</p>
                                    <p className="text-sm mt-2">Start by depositing funds to your wallet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
