"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { ChevronLeft, ChevronRight, Package, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/app/home/(components)/navbar";

// Prevent static generation since this page requires authentication
export const dynamic = 'force-dynamic';

interface Vehicle {
    _id: string;
    name: string;
    brand: string;
    image?: string[];
    fuelType: string;
    pricePerDay: number;
    pricePerHour: number;
}

interface Store {
    _id: string;
    name: string;
    address: string;
}

interface Order {
    _id: string;
    status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";
    paymentStatus: "pending" | "paid" | "refunded";
    totalAmount: number;
    startTime: string;
    endTime: string;
    createdAt?: string;
    vehicle: Vehicle;
    store: Store;
}

interface PaginationMetadata {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get("/api/v1/user/orders", {
                params: {
                    page,
                    limit
                }
            });

            if (response.data.success) {
                setOrders(response.data.data.orders);
                setPagination(response.data.data.pagination);
            } else {
                setError(response.data.message || "Failed to fetch orders");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOrderClick = (orderId: string) => {
        router.push(`/orders/${orderId}`);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
            case "ongoing":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
            case "completed":
                return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
            case "cancelled":
                return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
            default:
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
        }
    };

    if (error && !loading && orders.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0B0A1B] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-lg">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Orders
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={() => fetchOrders(currentPage)}
                            className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0A1B] pb-28">
            {/* Header */}
            <div className="pt-12 pb-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order History</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage your orders</p>
                </div>
            </div>

            {/* Orders Content */}
            <div className="max-w-6xl mx-auto px-4">
                {/* Skeleton Loading State */}
                {loading && (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <Card
                                key={`skeleton-${index}`}
                                className="rounded-xl border shadow-sm"
                            >
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 skeleton" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 skeleton" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 skeleton" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && orders.length === 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Orders Yet
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                You haven't placed any orders yet. Start browsing vehicles!
                            </p>
                            <button
                                onClick={() => router.push("/home")}
                                className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                            >
                                Browse Vehicles
                            </button>
                        </div>
                    </div>
                )}

                {/* Orders List */}
                {!loading && orders.length > 0 && (
                    <>
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card
                                    key={order._id}
                                    onClick={() => handleOrderClick(order._id)}
                                    className="group relative rounded-xl border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* Vehicle Image */}
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                {order.vehicle.image && order.vehicle.image.length > 0 ? (
                                                    <Image
                                                        src={order.vehicle.image[0]}
                                                        alt={order.vehicle.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="96px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                                            {order.vehicle.brand} {order.vehicle.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                                                            {order.vehicle.fuelType}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>
                                                            {formatDate(order.startTime)} {formatTime(order.startTime)} - {formatTime(order.endTime)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span className="truncate">{order.store.name}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-lg font-bold text-[#FF6B00]">
                                                        ₹{order.totalAmount}
                                                    </span>
                                                    <span className={`text-xs font-medium ${order.paymentStatus === "paid" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                                                        {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-6 mb-4">
                                <Button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.hasPrev}
                                    className="rounded-full"
                                    variant="outline"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <Button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.hasNext}
                                    className="rounded-full"
                                    variant="outline"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Navigation */}
            <Suspense fallback={<div className="h-20" />}>
                <Navbar />
            </Suspense>
        </div>
    );
}

// Wrap with Suspense for Next.js 15 compatibility
export default function OrdersPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-[#0B0A1B] pb-28">
                <div className="pt-12 pb-8 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2 skeleton" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 skeleton" />
                    </div>
                </div>
            </div>
        }>
            <OrdersPage />
        </Suspense>
    );
}
