"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { Calendar, MapPin, Phone, Clock, ArrowLeft, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface VehicleData {
    _id: string;
    name: string;
    brand: string;
    image?: string[];
    fuelType: string;
    pricePerDay: number;
    pricePerHour: number;
}

interface StoreData {
    _id: string;
    name: string;
    address: string;
    contactNumber?: string;
    openingTime: string;
    closingTime: string;
}

interface UserData {
    _id: string;
    name?: string;
    phoneNumber: string;
    email?: string;
}

interface OrderData {
    _id: string;
    status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";
    paymentStatus: "pending" | "paid" | "refunded";
    totalAmount: number;
    startTime: string;
    endTime: string;
    createdAt?: string;
    vehicle: VehicleData;
    store: StoreData;
    user: UserData;
}

function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!orderId) {
            setError("Order ID is missing");
            setLoading(false);
            return;
        }

        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(`/api/v1/orders/${orderId}`);

            if (response.data.success && response.data.data?.order) {
                setOrder(response.data.data.order);
            } else {
                setError(response.data.message || "Failed to load order details.");
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            let errorMessage = "An error occurred while loading order details.";

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            } else if (axiosError.request) {
                errorMessage = "Network error. Please check your connection.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
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
                return "from-green-500 to-emerald-600";
            case "ongoing":
                return "from-blue-500 to-indigo-600";
            case "completed":
                return "from-gray-500 to-gray-600";
            case "cancelled":
                return "from-red-500 to-rose-600";
            default:
                return "from-yellow-500 to-orange-600";
        }
    };

    const getStatusText = (status: string, paymentStatus: string) => {
        if (status === "cancelled") return "Order Cancelled";
        if (status === "completed") return "Ride Completed";
        if (status === "ongoing") return "Ride Ongoing";
        
        // Detailed checks for pending/confirmed states combined with payment
        if (status === "confirmed" && paymentStatus === "paid") return "Order Confirmed";
        if (status === "confirmed" && paymentStatus === "pending") return "Payment Pending"; // Edge case
        if (status === "pending" && paymentStatus === "paid") return "Processing Confirmation";
        if (status === "pending" && paymentStatus === "pending") return "Payment Pending";
        if (paymentStatus === "refunded") return "Payment Refunded";
        
        return "Order Status Update";
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
                <div className="px-4 pt-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
                <div className="px-4 mt-8">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                            Error Loading Order
                        </h2>
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            {error || "Order not found"}
                        </p>
                        <Button
                            onClick={() => router.push("/orders")}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <button
                    onClick={() => router.push("/orders")}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Orders</span>
                </button>
            </div>

            {/* Status Header */}
            <div className="px-4 mb-6">
                <div className={`bg-gradient-to-r ${getStatusColor(order.status)} rounded-2xl p-6 text-white shadow-lg`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">{getStatusText(order.status, order.paymentStatus)}</h1>
                    </div>
                    <p className="text-white/90 text-sm">
                        Order placed on {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                    </p>
                    <p className="text-white/80 text-xs mt-2 font-mono">
                        Order ID: {order._id}
                    </p>
                </div>
            </div>

            {/* Vehicle Details */}
            <div className="px-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Vehicle Details
                </h2>
                <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <Image
                                src={order.vehicle.image?.[0] || "/bike.png"}
                                alt={`${order.vehicle.brand} ${order.vehicle.name}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {order.vehicle.brand} {order.vehicle.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {order.vehicle.fuelType}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                ₹{order.vehicle.pricePerDay}/day
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Details */}
            <div className="px-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Booking Details
                </h2>
                <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm space-y-4">
                    {/* Pickup */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Pickup
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatDate(order.startTime)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTime(order.startTime)}
                            </p>
                        </div>
                    </div>

                    {/* Drop-off */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Drop-off
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatDate(order.endTime)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTime(order.endTime)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Details */}
            <div className="px-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Pickup Location
                </h2>
                <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {order.store.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.store.address}
                            </p>
                        </div>
                    </div>

                    {order.store.contactNumber && (
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.store.contactNumber}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.store.openingTime} - {order.store.closingTime}
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            <div className="px-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Payment Details
                </h2>
                <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Payment Status
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Status
                        </span>
                        <span className={`text-sm font-semibold capitalize ${order.paymentStatus === "paid" ? "text-green-600 dark:text-green-400" : order.paymentStatus === "refunded" ? "text-blue-600 dark:text-blue-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                            {order.paymentStatus}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            Total Amount
                        </span>
                        <span className="text-2xl font-bold text-[#F4AA05]">
                            ₹{order.totalAmount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="px-4">
                <Button
                    onClick={() => router.push("/orders")}
                    variant="outline"
                    className="w-full py-6 rounded-full"
                >
                    Back to All Orders
                </Button>
            </div>
        </div>
    );
}

// Wrap with Suspense for Next.js 15 compatibility
export default function OrderDetailsPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
                <div className="px-4 pt-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        }>
            <OrderDetailsPage />
        </Suspense>
    );
}
