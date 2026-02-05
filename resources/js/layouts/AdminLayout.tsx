import { Link, usePage } from '@inertiajs/react';
import { 
    Home, 
    Users, 
    Users2, 
    TrendingUp, 
    DollarSign, 
    PieChart, 
    FileText, 
    Settings,
    LogOut,
    Menu,
    X,
    Building,
    Wallet,
    BarChart3,
    Target,
    Calculator,
    Eye,
    Shield,
    FileCheck,
    ArrowRight,
    ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

interface NavItem {
    name: string;
    href: string;
    icon: any;
    badge?: string | number;
    children?: NavItem[];
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export default function AdminLayout({ children, title = "Admin Dashboard" }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard', 'management']);
    const { props } = usePage() as any;
    const user = props.auth?.user;

    const navigation: NavSection[] = [
        {
            title: 'Main',
            items: [
                { 
                    name: 'Dashboard', 
                    href: '/admin/dashboard', 
                    icon: Home,
                    badge: 'Overview'
                },
            ]
        },
        {
            title: 'User Management',
            items: [
                { 
                    name: 'Users', 
                    href: '/admin/users', 
                    icon: Users,
                    badge: 'Manage'
                },
                { 
                    name: 'Teams', 
                    href: '/admin/teams', 
                    icon: Users2,
                    badge: 'Network'
                },
            ]
        },
        {
            title: 'Financial',
            items: [
                { 
                    name: 'Wallets', 
                    href: '/admin/wallets', 
                    icon: Wallet,
                    badge: 'Balance'
                },
                { 
                    name: 'Transactions', 
                    href: '/admin/transactions', 
                    icon: DollarSign,
                    badge: 'History'
                },
                { 
                    name: 'Investments', 
                    href: '/admin/investments', 
                    icon: TrendingUp,
                    badge: 'Portfolio'
                },
            ]
        },
        {
            title: 'Property Management',
            items: [
                { 
                    name: 'Properties', 
                    href: '/admin/properties', 
                    icon: Building,
                    badge: 'Projects'
                },
                { 
                    name: 'Plots', 
                    href: '/admin/plots', 
                    icon: Target,
                    badge: 'Inventory'
                },
                { 
                    name: 'Sales', 
                    href: '/admin/sales', 
                    icon: PieChart,
                    badge: 'Revenue'
                },
                { 
                    name: 'Profits', 
                    href: '/admin/profits', 
                    icon: Calculator,
                    badge: 'Distribution'
                },
            ]
        },
        {
            title: 'Analytics',
            items: [
                { 
                    name: 'Reports', 
                    href: '/admin/reports', 
                    icon: BarChart3,
                    badge: 'Analytics'
                },
                { 
                    name: 'Audit Logs', 
                    href: '/admin/audit', 
                    icon: Eye,
                    badge: 'Security'
                },
            ]
        },
        {
            title: 'System',
            items: [
                { 
                    name: 'Settings', 
                    href: '/admin/settings', 
                    icon: Settings,
                    badge: 'Config'
                },
                { 
                    name: 'Security', 
                    href: '/admin/security', 
                    icon: Shield,
                    badge: 'Access'
                },
            ]
        },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const toggleSection = (section: string) => {
        setExpandedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => (
        <Link
            href={item.href}
            className={`group flex items-center px-${level === 0 ? '3' : '8'} py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentPath === item.href
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent hover:border-blue-700'
            }`}
        >
            <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                currentPath === item.href ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-700'
            }`} />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    currentPath === item.href 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {item.badge}
                </span>
            )}
            {item.children && (
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    expandedSections.includes('management') ? 'rotate-180' : ''
                }`} />
            )}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex flex-col w-80 bg-white shadow-xl">
                        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
                            <h2 className="text-xl font-bold text-white">ERP Admin Panel</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-white hover:text-gray-200 transition-colors duration-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <div className="p-4">
                                <div className="flex items-center mb-6">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {navigation.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-6">
                                    <button
                                        onClick={() => toggleSection(section.title.toLowerCase().replace(' ', ''))}
                                        className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                    >
                                        <span>{section.title}</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                                            expandedSections.includes(section.title.toLowerCase().replace(' ', '')) ? 'rotate-180' : ''
                                        }`} />
                                    </button>
                                    
                                    {expandedSections.includes(section.title.toLowerCase().replace(' ', '')) && (
                                        <div className="mt-2 space-y-1">
                                            {section.items.map((item, itemIndex) => (
                                                <NavItemComponent key={itemIndex} item={item} level={1} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
                    {/* Sidebar Header */}
                    <div className="flex items-center h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-white mr-3" />
                            <div>
                                <h2 className="text-xl font-bold text-white">ERP Admin</h2>
                                <p className="text-xs text-blue-100">Property Investment Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <div className="p-4">
                            {/* User Info Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-600">{user?.email}</p>
                                        <div className="flex items-center mt-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                user?.role === 'team_leader' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user?.role?.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {user?.status?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 text-blue-500 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500">Total Users</p>
                                            <p className="text-sm font-semibold text-gray-900">1,234</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500">Active Investments</p>
                                            <p className="text-sm font-semibold text-gray-900">₹45.6L</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Menu */}
                            {navigation.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-4">
                                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {section.title}
                                    </h3>
                                    <div className="mt-1 space-y-1">
                                        {section.items.map((item, itemIndex) => (
                                            <NavItemComponent key={itemIndex} item={item} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">© 2024 ERP System</span>
                            <div className="flex items-center space-x-2">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Settings className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-80 flex flex-col flex-1">
                {/* Top Navigation Bar */}
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden text-gray-500 hover:text-gray-600 p-2 rounded-md"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <div className="hidden lg:block">
                                    <div className="flex items-center space-x-4">
                                        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                                        <span className="text-sm text-gray-500">| Property Investment Management</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {/* Quick Actions */}
                                <div className="hidden md:flex items-center space-x-2">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                                        <FileCheck className="h-5 w-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                                        <Eye className="h-5 w-5" />
                                    </button>
                                </div>
                                
                                {/* User Menu */}
                                <div className="flex items-center space-x-3">
                                    <span className="hidden sm:block text-sm text-gray-700">
                                        Welcome, {user?.name}
                                    </span>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 p-2 rounded-md"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <main className="flex-1 bg-gray-50">
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
