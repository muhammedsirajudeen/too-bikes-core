"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@/constants/permissions.constant";
import { useAdminAuth } from "@/contexts/admin-auth.context";
import { 
    Users, 
    Package, 
    Car, 
    Store, 
    TrendingUp, 
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";

interface DashboardStats {
    users: {
        total: number;
        blocked: number;
    };
    orders: {
        total: number;
        pending: number;
        confirmed: number;
        rejected: number;
        pendingVerification: number;
    };
    stores: {
        total: number;
    };
    vehicles: {
        total: number;
    };
}

function DashboardContent() {
    const { admin, hasPermission } = useAdminAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('admin_access_token');
            if (!token) return;

            const statsData: DashboardStats = {
                users: { total: 0, blocked: 0 },
                orders: { total: 0, pending: 0, confirmed: 0, rejected: 0, pendingVerification: 0 },
                stores: { total: 0 },
                vehicles: { total: 0 },
            };

            // Fetch users count (only if has permission)
            if (hasPermission(Permission.USER_VIEW)) {
                try {
                    const usersRes = await fetch('/api/v1/admin/users?page=1&limit=1', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        statsData.users.total = usersData.pagination?.total || 0;
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            }

            // Fetch orders count
            if (hasPermission(Permission.ORDER_VIEW)) {
                try {
                    const ordersRes = await fetch('/api/v1/admin/orders?page=1&limit=1', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (ordersRes.ok) {
                        const ordersData = await ordersRes.json();
                        statsData.orders.total = ordersData.pagination?.total || 0;
                    }

                    // Fetch verification count
                    const verificationRes = await fetch('/api/v1/admin/orders/verification?page=1&limit=1', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (verificationRes.ok) {
                        const verificationData = await verificationRes.json();
                        statsData.orders.pendingVerification = verificationData.pagination?.total || 0;
                    }
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }

            // Fetch stores count
            if (hasPermission(Permission.STORE_VIEW)) {
                try {
                    const storesRes = await fetch('/api/v1/stores', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (storesRes.ok) {
                        const storesData = await storesRes.json();
                        statsData.stores.total = storesData.data?.length || 0;
                    }
                } catch (error) {
                    console.error('Error fetching stores:', error);
                }
            }

            // Fetch vehicles count  
            if (hasPermission(Permission.VEHICLE_VIEW)) {
                try {
                    const vehiclesRes = await fetch('/api/v1/vehicles', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (vehiclesRes.ok) {
                        const vehiclesData = await vehiclesRes.json();
                        statsData.vehicles.total = vehiclesData.data?.length || 0;
                    }
                } catch (error) {
                    console.error('Error fetching vehicles:', error);
                }
            }

            setStats(statsData);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({ 
        title, 
        value, 
        icon: Icon, 
        color, 
        subtitle 
    }: { 
        title: string; 
        value: number | string; 
        //eslint-disable-next-line
        icon: any; 
        color: string; 
        subtitle?: string;
    }) => (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoading ? "..." : value}
            </p>
            {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {admin?.username || 'Admin'}!
                </h2>
                <p className="text-blue-100">
                        Here&apos;s what&apos;s happening with your platform today.
                    </p>
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <span className="text-sm font-medium capitalize">Role: {admin?.role || 'Admin'}</span>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Users - Only show if has permission */}
                    <PermissionGuard permission={Permission.USER_VIEW}>
                        <StatCard
                            title="Total Users"
                            value={stats?.users.total || 0}
                            icon={Users}
                            color="bg-blue-600"
                            subtitle="Registered users"
                        />
                    </PermissionGuard>

                    {/* Orders */}
                    <PermissionGuard permission={Permission.ORDER_VIEW}>
                        <StatCard
                            title="Total Orders"
                            value={stats?.orders.total || 0}
                            icon={Package}
                            color="bg-green-600"
                            subtitle="All time orders"
                        />
                    </PermissionGuard>

                    {/* Stores */}
                    <PermissionGuard permission={Permission.STORE_VIEW}>
                        <StatCard
                            title="Active Stores"
                            value={stats?.stores.total || 0}
                            icon={Store}
                            color="bg-purple-600"
                            subtitle="Partner stores"
                        />
                    </PermissionGuard>

                    {/* Vehicles */}
                    <PermissionGuard permission={Permission.VEHICLE_VIEW}>
                        <StatCard
                            title="Vehicles"
                            value={stats?.vehicles.total || 0}
                            icon={Car}
                            color="bg-orange-600"
                            subtitle="Available bikes"
                        />
                    </PermissionGuard>
                </div>

                {/* Order Statistics - Only if has permission */}
                <PermissionGuard permission={Permission.ORDER_VIEW}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Status Breakdown */}
                        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Order Status
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        <span className="text-gray-600 dark:text-gray-400">Pending Verification</span>
                                    </div>
                                    <span className="font-semibold text-yellow-600">
                                        {stats?.orders.pendingVerification || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
                                    </div>
                                    <span className="font-semibold text-green-600">
                                        {stats?.orders.confirmed || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-gray-600 dark:text-gray-400">Rejected</span>
                                    </div>
                                    <span className="font-semibold text-red-600">
                                        {stats?.orders.rejected || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <PermissionGuard permission={Permission.ORDER_VERIFY}>
                                    <a
                                        href="/admin/orders/verification"
                                        className="block w-full px-4 py-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    >
                                        <p className="font-medium text-blue-900 dark:text-blue-300">
                                            Review Pending Orders
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {stats?.orders.pendingVerification || 0} orders waiting
                                        </p>
                                    </a>
                                </PermissionGuard>

                                <PermissionGuard permission={Permission.ORDER_VIEW}>
                                    <a
                                        href="/admin/orders"
                                        className="block w-full px-4 py-3 text-left bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                    >
                                        <p className="font-medium text-green-900 dark:text-green-300">
                                            View All Orders
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Manage customer orders
                                        </p>
                                    </a>
                                </PermissionGuard>

                                <PermissionGuard permission={Permission.USER_VIEW}>
                                    <a
                                        href="/admin/users"
                                        className="block w-full px-4 py-3 text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                    >
                                        <p className="font-medium text-purple-900 dark:text-purple-300">
                                            Manage Users
                                        </p>
                                        <p className="text-sm text-purple-600 dark:text-purple-400">
                                            View and manage users
                                        </p>
                                    </a>
                                </PermissionGuard>
                            </div>
                        </div>
                    </div>
                </PermissionGuard>

                {/* System Info */}
                <div className="bg-white dark:bg-[#1a1a2e] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        System Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Role</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {admin?.role || 'Admin'}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Username</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {admin?.username || 'N/A'}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Permissions</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {admin?.permissions?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default function AdminDashboard() {
    return (
        <AdminLayout pageTitle="Dashboard" pageSubtitle="Overview of your platform">
            <DashboardContent />
        </AdminLayout>
    );
}
