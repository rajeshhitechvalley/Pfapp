import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    Settings, 
    Shield, 
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Save,
    RefreshCw,
    Bell,
    Users,
    Database,
    Globe,
    Lock,
    Key,
    Mail,
    Smartphone,
    DollarSign
} from 'lucide-react';

interface SystemSettings {
    site_name: string;
    site_description: string;
    admin_email: string;
    maintenance_mode: boolean;
    registration_enabled: boolean;
    min_investment_amount: number;
    max_investment_amount: number;
    profit_distribution_rate: number;
    auto_approve_investments: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
    backup_enabled: boolean;
    backup_frequency: string;
    session_timeout: number;
    created_at: string;
    updated_at: string;
}

interface AdminSettingsProps {
    settings: SystemSettings;
}

export default function AdminSettings({ settings }: AdminSettingsProps) {
    return (
        <AdminLayout title="System Settings">
            <Head title="Settings - Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                            <p className="text-sm text-gray-600 mt-1">Configure system-wide settings and preferences</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                                <Save className="h-4 w-4 mr-2" />
                                Save Settings
                            </button>
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset to Default
                            </button>
                        </div>
                    </div>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Settings className="h-6 w-6 text-gray-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                                <input
                                    type="text"
                                    defaultValue={settings.site_name}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter site name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                                <textarea
                                    defaultValue={settings.site_description}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter site description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                <input
                                    type="email"
                                    defaultValue={settings.admin_email}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    defaultChecked={settings.maintenance_mode}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700">Enable Maintenance Mode</label>
                            </div>
                        </div>
                    </div>

                    {/* Investment Settings */}
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <DollarSign className="h-6 w-6 text-gray-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Investment Settings</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Investment Amount (₹)</label>
                                <input
                                    type="number"
                                    defaultValue={settings.min_investment_amount}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Investment Amount (₹)</label>
                                <input
                                    type="number"
                                    defaultValue={settings.max_investment_amount}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="100000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profit Distribution Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue={settings.profit_distribution_rate}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="10"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    defaultChecked={settings.auto_approve_investments}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700">Auto-approve Investments</label>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Bell className="h-6 w-6 text-gray-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    defaultChecked={settings.email_notifications}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700">Email Notifications</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    defaultChecked={settings.sms_notifications}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700">SMS Notifications</label>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Shield className="h-6 w-6 text-gray-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Enabled</label>
                                <input
                                    type="checkbox"
                                    defaultChecked={settings.registration_enabled}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700">Allow New User Registration</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                                <input
                                    type="number"
                                    defaultValue={settings.session_timeout}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="30"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Backup Settings */}
                    <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Database className="h-6 w-6 text-gray-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Backup Settings</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    defaultChecked={settings.backup_enabled}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700">Enable Backups</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                                <select
                                    defaultValue={settings.backup_frequency}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Last updated: {new Date(settings.updated_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Clear Cache
                            </button>
                            <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200">
                                <Download className="h-4 w-4 mr-2" />
                                Export Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
