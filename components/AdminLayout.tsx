"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
    Home, 
    Users, 
    Settings, 
    LogOut, 
    Package, 
    User, 
    Moon, 
    Sun, 
    Store, 
    Car,
    FileText 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth.context";
import { Permission } from "@/constants/permissions.constant";

interface AdminLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
    pageSubtitle?: string;
}

function AdminLayoutContent({ children, pageTitle = "Dashboard", pageSubtitle }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [verificationCount, setVerificationCount] = useState<number>(0);
    
    // Use admin auth context for permissions
    const { admin, hasPermission, logout } = useAdminAuth();

    useEffect(() => {
        setMounted(true);

        const token = localStorage.getItem('admin_access_token');
        if (!token) {
            router.push('/');
            return;
        }
    }, [router]);

    // Fetch verification count on mount and every 30 seconds
    useEffect(() => {
        const fetchVerificationCount = async () => {
            try {
                const token = localStorage.getItem('admin_access_token');
                if (!token) return;

                const response = await fetch('/api/v1/admin/orders/verification?page=1&limit=1', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setVerificationCount(data.pagination?.total || 0);
                }
            } catch (error) {
                console.error('Failed to fetch verification count:', error);
            }
        };

        fetchVerificationCount();
        const interval = setInterval(fetchVerificationCount, 30000); // Refresh every 30s

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    // Define navigation items with their required permissions
    const allNavigationItems = [
        { name: 'Dashboard', icon: Home, href: '/admin/dashboard', permission: Permission.DASHBOARD_VIEW },
        { name: 'Users', icon: Users, href: '/admin/users', permission: Permission.USER_VIEW },
        { name: 'Orders', icon: Package, href: '/admin/orders', permission: Permission.ORDER_VIEW },
        { name: 'Order Verification', icon: FileText, href: '/admin/orders/verification', badge: verificationCount, permission: Permission.ORDER_VERIFY },
        { name: 'Store Management', icon: Store, href: '/admin/stores', permission: Permission.STORE_VIEW },
        { name: 'Vehicle Management', icon: Car, href: '/admin/vehicles', permission: Permission.VEHICLE_VIEW },
        { name: 'Settings', icon: Settings, href: '/admin/settings', permission: Permission.SETTINGS_VIEW },
    ];

    // Filter navigation items based on permissions
    const navigationItems = allNavigationItems.filter(item => hasPermission(item.permission));

    const adminUsername = admin?.username || 'Admin';
    const initials = adminUsername
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AU';

    return (
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <div className="flex min-h-screen w-full">
                <Sidebar collapsible="icon">
                    <SidebarHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <span className="font-bold group-data-[collapsible=icon]:hidden">Admin Panel</span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigationItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    onClick={() => router.push(item.href)}
                                                    tooltip={item.name}
                                                    isActive={isActive}
                                                >
                                                    <Icon />
                                                    <span>{item.name}</span>
                                                </SidebarMenuButton>
                                                {item.badge !== undefined && item.badge > 0 && (
                                                    <SidebarMenuBadge className="bg-red-500 text-white">
                                                        {item.badge}
                                                    </SidebarMenuBadge>
                                                )}
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-gray-200 dark:border-gray-700 p-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-blue-600 text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{adminUsername}</span>
                                        <span className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {admin?.role || 'Admin'}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={logout} tooltip="Logout">
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0f0f23]">
                    {/* Header with sidebar trigger */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-[#1a1a2e] border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                        <SidebarTrigger />
                        <div className="flex items-center justify-between flex-1">
                            <div>
                                {pageSubtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{pageSubtitle}</p>}
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{pageTitle}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    Press <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">Ctrl+B</kbd> to toggle
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="h-9 w-9"
                                >
                                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}

export default function AdminLayout(props: AdminLayoutProps) {
    return (
        <AdminAuthProvider>
            <AdminLayoutContent {...props} />
        </AdminAuthProvider>
    );
}
