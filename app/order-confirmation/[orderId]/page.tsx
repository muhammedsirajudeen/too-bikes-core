"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { CheckCircle2, Calendar, MapPin, Phone, Clock, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface OrderConfirmationPageProps {
    params: Promise<{ orderId: string }>;
}

interface OrderData {
    _id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    startTime: string;
    endTime: string;
    createdAt?: string;
    vehicle: {
        _id: string;
        name: string;
        brand: string;
        image?: string[];
        fuelType: string;
        pricePerDay: number;
        pricePerHour: number;
    };
    store: {
        _id: string;
        name: string;
        address: string;
        contactNumber?: string;
        openingTime: string;
        closingTime: string;
    };
    user: {
        _id: string;
        name?: string;
        phoneNumber: string;
        email?: string;
    };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const { orderId } = use(params);
    const router = useRouter();

    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setError("Order ID is required");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response = await axiosInstance.get(`/api/v1/orders/${orderId}`);

                if (!response.data.success) {
                    setError(response.data.message || "Failed to fetch order details");
                    setOrder(null);
                    setLoading(false);
                    return;
                }

                setOrder(response.data.data.order);
                setError("");
            } catch (err) {
                const axiosError = err as AxiosError<{ message?: string }>;
                let errorMessage = "An error occurred while fetching order details.";

                if (axiosError.response) {
                    const status = axiosError.response.status;
                    const errorData = axiosError.response.data;

                    if (errorData?.message) {
                        errorMessage = errorData.message;
                    } else if (status === 404) {
                        errorMessage = "Order not found.";
                    } else if (status >= 500) {
                        errorMessage = `Server error (${status}). Please try again later.`;
                    }
                } else if (axiosError.request) {
                    errorMessage = "Network error. Please check your connection.";
                }

                setError(errorMessage);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

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
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "ongoing":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "completed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
            case "cancelled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
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
                            onClick={() => router.push("/")}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Go to Home
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
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                </button>
            </div>

            {/* Success Banner */}
            <div className="px-4 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
                    </div>
                    <p className="text-green-50 text-sm">
                        Your order has been successfully placed
                    </p>
                    <p className="text-green-50 text-xs mt-2 font-mono">
                        Order ID: {order._id}
                    </p>
                </div>
            </div>

            {/* Order Status */}
            <div className="px-4 mb-6">
                <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status
                            )}`}
                        >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payment</span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.paymentStatus
                            )}`}
                        >
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                    </div>
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

            {/* Price Summary */}
            <div className="px-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Price Summary
                </h2>
                <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm">
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

            {/* Action Buttons */}
            <div className="px-4 space-y-3">
                <Button
                    onClick={() => router.push("/")}
                    className="w-full bg-[#F4AA05] hover:bg-[#cf9002] text-white font-semibold py-6 rounded-full shadow-md"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                </Button>
            </div>
        </div>
    );
}
