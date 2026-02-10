import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { User, Home, Users, Wallet, TrendingUp, Settings } from 'lucide-react';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
                            <p className="mt-2 text-gray-600">Welcome to your personal dashboard</p>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Profile Card */}
                                <div className="bg-blue-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center">
                                        <User className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                                            <p className="text-sm text-gray-600">Manage your profile</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Link 
                                            href="/profile"
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View Profile →
                                        </Link>
                                    </div>
                                </div>

                                {/* Investments Card */}
                                <div className="bg-green-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Investments</h3>
                                            <p className="text-sm text-gray-600">View your investments</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Link 
                                            href="/investment"
                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                        >
                                            View Investments →
                                        </Link>
                                    </div>
                                </div>

                                {/* Wallet Card */}
                                <div className="bg-yellow-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center">
                                        <Wallet className="h-8 w-8 text-yellow-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Wallet</h3>
                                            <p className="text-sm text-gray-600">Manage your wallet</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Link 
                                            href="/wallet"
                                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                                        >
                                            View Wallet →
                                        </Link>
                                    </div>
                                </div>

                                {/* Teams Card */}
                                <div className="bg-purple-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center">
                                        <Users className="h-8 w-8 text-purple-600" />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
                                            <p className="text-sm text-gray-600">Manage your teams</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Link 
                                            href="/teams"
                                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                        >
                                            View Teams →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Link 
                                        href="/investment/create"
                                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                    >
                                        New Investment
                                    </Link>
                                    <Link 
                                        href="/teams/create"
                                        className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                                    >
                                        Create Team
                                    </Link>
                                    <Link 
                                        href="/wallet/deposit"
                                        className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors text-center"
                                    >
                                        Deposit Funds
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
