"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Home, Users, Settings, LogOut, Package } from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [adminUsername, setAdminUsername] = useState<string>("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check for admin token
        const token = localStorage.getItem('admin_access_token');
        if (!token) {
            router.push('/');
            return;
        }

        // Decode token to get admin info
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
            // Call logout API to clear the HTTP-only cookie
            await fetch('/api/v1/admin/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout API error:', error);
        }

        // Clear access token from localStorage
        localStorage.removeItem('admin_access_token');

        // Redirect to home
        router.push('/');
    };

    if (!mounted) return null;

    const navigationItems = [
        { name: 'Dashboard', icon: Home, href: '/admin/dashboard' },
        { name: 'Users', icon: Users, href: '/admin/users' },
        { name: 'Orders', icon: Package, href: '/admin/orders' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 py-6">
                <nav className="space-y-2 px-3">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    router.push(item.href);
                                    setIsSidebarOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="mb-3 px-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
                    <p className="font-semibold">{adminUsername}</p>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-start gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B]">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#1a1a2e] border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <SheetHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <SheetTitle>Navigation</SheetTitle>
                            </SheetHeader>
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex h-screen">
                {/* Desktop Sidebar */}
                <aside className="w-64 bg-white dark:bg-[#1a1a2e] border-r border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                    </div>
                    <SidebarContent />
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl font-bold mb-2">Welcome, {adminUsername}!</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Manage your TooBikes platform from here.
                            </p>

                            {/* Dashboard Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                                            <p className="text-2xl font-bold">1,234</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                                            <p className="text-2xl font-bold">567</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Bikes</p>
                                            <p className="text-2xl font-bold">89</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Main Content */}
            <div className="md:hidden p-6">
                <h2 className="text-2xl font-bold mb-2">Welcome, {adminUsername}!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Manage your TooBikes platform from here.
                </p>

                {/* Dashboard Cards */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold">1,234</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold">567</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Bikes</p>
                                <p className="text-2xl font-bold">89</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
