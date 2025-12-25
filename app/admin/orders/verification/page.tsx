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
import { Home, Users, Settings, LogOut, Package, User, Moon, Sun, Store, Car, Search, FileText, CheckCircle, XCircle, Loader2, ZoomIn, X } from "lucide-react";
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
    createdAt: string;
}

export default function OrderVerificationPage() {
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
    
    // Image Zoom Modal
    const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
    const [zoomImageLabel, setZoomImageLabel] = useState<string>("");
    
    // Confirmation Dialogs
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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

    // Reset page to 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    // Fetch orders when page OR search changes
    useEffect(() => {
        if (mounted) {
            fetchOrders();
        }
    }, [currentPage, debouncedSearchQuery, mounted]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch(`/api/v1/admin/orders/verification?page=${currentPage}&limit=${itemsPerPage}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
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

    const handleImageZoom = (url: string, label: string) => {
        setZoomImageUrl(url);
        setZoomImageLabel(label);
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

    // Backend handles filtering, just apply search on frontend
    const filteredOrders = orders.filter((order) => {
        const query = searchQuery.toLowerCase();
        const userName = order.user.name?.toLowerCase() || "";
        const userPhone = order.user.phoneNumber.toLowerCase();
        const vehicleName = `${order.vehicle.brand} ${order.vehicle.name}`.toLowerCase();
        const orderId = order._id.toLowerCase();

        return userName.includes(query) ||
            userPhone.includes(query) ||
            vehicleName.includes(query) ||
            orderId.includes(query);
    });

    // Backend now handles pagination, so we use orders directly
    const paginatedOrders = filteredOrders;

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
                                        const isActive = item.href === '/admin/orders/verification';
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Verification</h2>
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
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pending Verification</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Review licenses for paid orders awaiting confirmation
                                    </p>
                                </div>

                                <div className="relative w-full sm:w-[250px]">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search orders..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-500" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
                                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                        {orders.length === 0 ? "All caught up!" : "No orders found"}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {orders.length === 0 ? "No orders pending verification at the moment." : "Try adjusting your search."}
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
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleReviewOrder(order)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                Review License
                                                            </Button>
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
                            Review the customer&apos;s driving license and confirm or reject the order.
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
                                    <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-500" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading license images...</p>
                                </div>
                            ) : licenseUrls ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Front Side</p>
                                        <div 
                                            className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                                            onClick={() => handleImageZoom(licenseUrls.frontUrl, "License Front")}
                                        >
                                            <Image
                                                src={licenseUrls.frontUrl}
                                                alt="License Front"
                                                fill
                                                className="object-contain transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Back Side</p>
                                        <div 
                                            className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                                            onClick={() => handleImageZoom(licenseUrls.backUrl, "License Back")}
                                        >
                                            <Image
                                                src={licenseUrls.backUrl}
                                                alt="License Back"
                                                fill
                                                className="object-contain transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
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
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={!licenseUrls || actionLoading}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Order
                        </Button>
                        <Button
                            onClick={() => setConfirmDialogOpen(true)}
                            disabled={!licenseUrls || actionLoading}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Zoom Modal */}
            <Dialog open={!!zoomImageUrl} onOpenChange={() => setZoomImageUrl(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
                    <div className="relative w-full h-[90vh]">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setZoomImageUrl(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        {zoomImageUrl && (
                            <Image
                                src={zoomImageUrl}
                                alt={zoomImageLabel}
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
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
                            disabled={actionLoading}
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
