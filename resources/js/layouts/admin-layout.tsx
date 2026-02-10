import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    Users, 
    Building, 
    TrendingUp, 
    Wallet, 
    Settings, 
    FileText,
    Home,
    Landmark,
    PieChart,
    Shield,
    HelpCircle
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarProvider,
    useSidebar,
} from '@/components/ui/sidebar';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import type { NavItem } from '@/types';
import type { SharedData } from '@/types';
import AppLogo from '@/components/app-logo';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Properties',
        href: '/admin/properties',
        icon: Building,
    },
    {
        title: 'Plots',
        href: '/admin/plots',
        icon: Landmark,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Teams',
        href: '/admin/teams',
        icon: Users,
    },
    {
        title: 'Investments',
        href: '/admin/investments',
        icon: TrendingUp,
    },
    {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: Wallet,
    },
    {
        title: 'Sales',
        href: '/admin/sales',
        icon: FileText,
    },
    {
        title: 'Profits',
        href: '/admin/profits',
        icon: PieChart,
    },
    {
        title: 'Wallets',
        href: '/admin/wallets',
        icon: Wallet,
    },
    {
        title: 'Reports',
        href: '/admin/reports',
        icon: FileText,
    },
    {
        title: 'Audit',
        href: '/admin/audit',
        icon: Shield,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
    {
        title: 'Help',
        href: '/help',
        icon: HelpCircle,
    },
];

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function AdminLayout({ children, title = 'Admin Panel', breadcrumbs = [] }: AdminLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            
            <SidebarProvider>
                <Sidebar collapsible="icon" variant="inset">
                    <SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link href="/admin/dashboard" prefetch>
                                        <AppLogo />
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Main</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminNavItems.slice(0, 6).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>Management</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminNavItems.slice(6, 12).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>System</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminNavItems.slice(12).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <NavFooter items={footerNavItems} className="mt-auto" />
                    <NavUser user={auth.user} />
                </SidebarFooter>
            </Sidebar>
        </SidebarProvider>

            <div className="lg:pl-64">
                <main className="p-6">
                    {breadcrumbs.length > 0 && (
                        <nav className="flex mb-4" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                {breadcrumbs.map((crumb, index) => (
                                    <li key={index} className="inline-flex items-center">
                                        {index > 0 && (
                                            <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                            </svg>
                                        )}
                                        {crumb.href ? (
                                            <Link href={crumb.href} className="text-gray-700 hover:text-gray-900">
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-500">{crumb.label}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
