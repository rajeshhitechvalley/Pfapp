import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { TrendingUp, Plus, Eye, DollarSign, Building, Calendar, Target } from 'lucide-react';

export default function InvestmentIndex() {
    return (
        <AppLayout>
            <Head title="Investments" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
                                    <p className="mt-2 text-gray-600">Track and manage your investment portfolio</p>
                                </div>
                                <Link 
                                    href="/investment/create"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Investment
                                </Link>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Investment Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <DollarSign className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Total Invested</h3>
                                            <p className="text-2xl font-bold text-blue-600">$0.00</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-green-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Total Returns</h3>
                                            <p className="text-2xl font-bold text-green-600">$0.00</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <Target className="h-8 w-8 text-purple-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Active Investments</h3>
                                            <p className="text-2xl font-bold text-purple-600">0</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <Calendar className="h-8 w-8 text-yellow-600" />
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Maturity Value</h3>
                                            <p className="text-2xl font-bold text-yellow-600">$0.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Investment List */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Investment Portfolio</h3>
                                    <Link 
                                        href="/investment/portfolio"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                    >
                                        View Portfolio
                                        <Eye className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                                
                                <div className="text-center py-8 text-gray-500">
                                    <Building className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>No investments yet</p>
                                    <p className="text-sm mt-2">Start investing to build your portfolio</p>
                                    <Link 
                                        href="/investment/create"
                                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Investment
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Link 
                                        href="/investment/create"
                                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                    >
                                        New Investment
                                    </Link>
                                    <Link 
                                        href="/investment/portfolio"
                                        className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                                    >
                                        View Portfolio
                                    </Link>
                                    <Link 
                                        href="/wallet"
                                        className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors text-center"
                                    >
                                        Add Funds
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
