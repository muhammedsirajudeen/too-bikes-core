"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Users, Settings, LogOut, Package, User, Moon, Sun, Store, Car } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminDashboard() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [adminUsername, setAdminUsername] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        setMounted(true);

        const token = localStorage.getItem('admin_access_token');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const payload = JSON.parse(jsonPayload);
            setAdminUsername(payload.username || 'Admin');
        } catch (error) {
            console.error('Failed to decode token:', error);
            router.push('/');
        }
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/v1/admin/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout API error:', error);
        }
        localStorage.removeItem('admin_access_token');
        router.push('/');
    };

    if (!mounted) return null;

    const navigationItems = [
        { name: 'Dashboard', icon: Home, href: '/admin/dashboard' },
        { name: 'Users', icon: Users, href: '/admin/users' },
        { name: 'Orders', icon: Package, href: '/admin/orders' },
        { name: 'Store Management', icon: Store, href: '/admin/stores' },
        { name: 'Vehicle Management', icon: Car, href: '/admin/vehicles' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

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
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    onClick={() => router.push(item.href)}
                                                    tooltip={item.name}
                                                >
                                                    <Icon />
                                                    <span>{item.name}</span>
                                                </SidebarMenuButton>
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
                                        <span className="truncate text-xs text-gray-500 dark:text-gray-400">Admin User</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
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
                                <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Home</h2>
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
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Dashboard</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Overview of your TooBikes platform metrics and analytics.
                            </p>

                            {/* Dashboard Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">1,234</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">↑ 12% from last month</p>
                                </div>

                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                                        <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">567</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">↑ 8% from last month</p>
                                </div>

                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Bikes</p>
                                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <p className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">89</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">↑ 5% from last month</p>
                                </div>
                            </div>

                            {/* Additional sections matching the reference image */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Breakdown</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Platform Revenue</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">₹45,000</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Vendor Payouts</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">₹32,000</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Delivery Payouts</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">₹8,500</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Customer Overview</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Total Customers</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">1,234</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Active Customers</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">892</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Inactive Customers</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">342</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Repeat Customers</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">456</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
