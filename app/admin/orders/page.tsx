"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useDebounce } from "@/hooks/useDebounce";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Home, Users, Settings, LogOut, Package, User, Moon, Sun, Store, Car, Search, Filter, FileText, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { toast } from "sonner";

interface Order {
    _id: string;
    user: {
        _id: string;
        name?: string;
        email?: string;
        phoneNumber: string;
    };
    vehicle: {
        _id: string;
        name: string;
        brand: string;
        licensePlate: string;
    };
    store: {
        _id: string;
        name: string;
        location?: string;
    };
    startTime: string;
    endTime: string;
    totalAmount: number;
    status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";
    paymentStatus: "pending" | "paid" | "refunded";
    license?: {
        frontImage: string;
        backImage: string;
    };
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    cancellationReason?: string;
    createdAt: string;
}

export default function OrdersPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [adminUsername, setAdminUsername] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // License Review Modal
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [licenseUrls, setLicenseUrls] = useState<{ frontUrl: string; backUrl: string } | null>(null);
    const [loadingLicense, setLoadingLicense] = useState(false);
    
    // Confirmation Dialogs
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Filter/Search State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 10;

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

        fetchOrders();
    }, [router]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterStatus, filterPaymentStatus]);

    // Fetch orders when page OR filters change
    useEffect(() => {
        if (mounted) {
            fetchOrders();
        }
    }, [currentPage, debouncedSearchQuery, filterStatus, filterPaymentStatus, mounted]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            
            // Build query params
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });
            
            // Add filters if not "all"
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (filterPaymentStatus !== 'all') params.append('paymentStatus', filterPaymentStatus);
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
            
            const response = await fetch(`/api/v1/admin/orders?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalOrders(data.pagination.total);
                }
            } else {
                toast.error("Failed to load orders");
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleReviewOrder = async (order: Order) => {
        if (!order.license) {
            toast.error("No license information available for this order");
            return;
        }

        setSelectedOrder(order);
        setReviewModalOpen(true);
        setLoadingLicense(true);

        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch(
                `/api/v1/admin/orders/${order._id}/license?frontKey=${encodeURIComponent(order.license.frontImage)}&backKey=${encodeURIComponent(order.license.backImage)}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const data = await response.json();
            if (data.success) {
                setLicenseUrls(data.data);
            } else {
                toast.error("Failed to load license images");
            }
        } catch (error) {
            console.error('Failed to fetch license URLs:', error);
            toast.error("Failed to load license images");
        } finally {
            setLoadingLicense(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!selectedOrder) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch(`/api/v1/admin/orders/${selectedOrder._id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'confirm' }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Order confirmed successfully");
                setReviewModalOpen(false);
                setConfirmDialogOpen(false);
                setSelectedOrder(null);
                setLicenseUrls(null);
                fetchOrders();
            } else {
                toast.error(data.message || "Failed to confirm order");
            }
        } catch (error) {
            console.error('Failed to confirm order:', error);
            toast.error("Failed to confirm order");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectOrder = async () => {
        if (!selectedOrder) return;

        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch(`/api/v1/admin/orders/${selectedOrder._id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'reject',
                    reason: rejectReason,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Order rejected successfully");
                setReviewModalOpen(false);
                setRejectDialogOpen(false);
                setRejectReason("");
                setSelectedOrder(null);
                setLicenseUrls(null);
                fetchOrders();
            } else {
                toast.error(data.message || "Failed to reject order");
            }
        } catch (error) {
            console.error('Failed to reject order:', error);
            toast.error("Failed to reject order");
        } finally {
            setActionLoading(false);
        }
    };

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
        { name: 'Order Verification', icon: FileText, href: '/admin/orders/verification' },
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

    // Backend now handles ALL filtering (status, payment, search)
    // Just display the orders returned from backend
    const paginatedOrders = orders;

    const getStatusBadge = (status: Order['status']) => {
        const statusConfig = {
            pending: { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200", icon: Clock },
            confirmed: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-800 dark:text-blue-200", icon: CheckCircle },
            ongoing: { bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-800 dark:text-purple-200", icon: Package },
            completed: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200", icon: CheckCircle },
            cancelled: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-800 dark:text-red-200", icon: XCircle },
        };

        const config = statusConfig[status];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus: Order['paymentStatus']) => {
        const config = {
            pending: { bg: "bg-gray-100 dark:bg-gray-900/20", text: "text-gray-800 dark:text-gray-200" },
            paid: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200" },
            refunded: { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-800 dark:text-orange-200" },
        };

        const { bg, text } = config[paymentStatus];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </span>
        );
    };

    const canReviewOrder = (order: Order) => {
        return order.status === "pending" && order.paymentStatus === "paid" && order.license;
    };

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
                                        const isActive = item.href === '/admin/orders';
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
                    <div className="sticky top-0 z-10 bg-white dark:bg-[#1a1a2e] border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                        <SidebarTrigger />
                        <div className="flex items-center justify-between flex-1">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Management</h2>
                            </div>
                            <div className="flex items-center gap-3">
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

                    <div className="p-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        View confirmed, ongoing, completed, and cancelled orders
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    {/* Search Input */}
                                    <div className="relative w-full sm:w-[250px]">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search by user, vehicle, ID..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="w-full sm:w-[180px]">
                                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                                            <SelectTrigger>
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4 text-gray-500" />
                                                    <SelectValue placeholder="Filter Status" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Payment Filter */}
                                    <div className="w-full sm:w-[180px]">
                                        <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                                            <SelectTrigger>
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4 text-gray-500" />
                                                    <SelectValue placeholder="Payment" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Payments</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="refunded">Refunded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
                                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                        {orders.length === 0 ? "No orders yet" : "No orders found"}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {orders.length === 0 ? "Orders will appear here once customers make bookings." : "Try adjusting your search or filters."}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-[#0f0f23] border-b border-gray-200 dark:border-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Order ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Customer
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Vehicle
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Duration
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Payment
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                                {paginatedOrders.map((order) => (
                                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-[#0f0f23]">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-mono text-gray-900 dark:text-white">
                                                                #{order._id.slice(-8)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {order.user.name || "Unknown"}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {order.user.phoneNumber}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {order.vehicle.brand} {order.vehicle.name}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {order.vehicle.licensePlate}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {new Date(order.startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(order.endTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                ₹{order.totalAmount.toLocaleString('en-IN')}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(order.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getPaymentBadge(order.paymentStatus)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {canReviewOrder(order) && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleReviewOrder(order)}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                    Review Order
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="px-6 pb-4">
                                            <DataTablePagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* License Review Modal */}
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review License - Order #{selectedOrder?._id.slice(-8)}</DialogTitle>
                        <DialogDescription>
                            Review the customer's driving license and confirm or reject the order.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Order Details */}
                        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg space-y-2">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Order Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Customer</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder?.user.name || "Unknown"}</p>
                                    <p className="text-xs text-gray-500">{selectedOrder?.user.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Vehicle</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedOrder?.vehicle.brand} {selectedOrder?.vehicle.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{selectedOrder?.vehicle.licensePlate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Duration</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedOrder && new Date(selectedOrder.startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} - {selectedOrder && new Date(selectedOrder.endTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                                    <p className="font-medium text-gray-900 dark:text-white">₹{selectedOrder?.totalAmount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* License Images */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Driving License</h3>
                            
                            {loadingLicense ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">Loading license images...</p>
                                </div>
                            ) : licenseUrls ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Front Side</p>
                                        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <Image
                                                src={licenseUrls.frontUrl}
                                                alt="License Front"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Back Side</p>
                                        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <Image
                                                src={licenseUrls.backUrl}
                                                alt="License Back"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-red-600 dark:text-red-400">
                                    Failed to load license images
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setReviewModalOpen(false);
                                setSelectedOrder(null);
                                setLicenseUrls(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={!licenseUrls}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Order
                        </Button>
                        <Button
                            onClick={() => setConfirmDialogOpen(true)}
                            disabled={!licenseUrls}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Order Dialog */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to confirm this order? The customer will be notified and the booking will be finalized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmOrder}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                "Confirm Order"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Order Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this order. The customer will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Reason for rejection (e.g., Invalid license, Expired license)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectOrder}
                            disabled={actionLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                "Reject Order"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    );
}
