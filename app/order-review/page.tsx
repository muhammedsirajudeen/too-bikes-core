"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { Calendar, MapPin, Phone, Clock, ArrowLeft, CheckCircle2, CreditCard, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import LicenseUploadModal from "@/components/LicenseUploadModal";
import { useRazorpay } from "@/hooks/useRazorpay";

interface VehicleData {
    _id: string;
    name: string;
    brand: string;
    image?: string[];
    fuelType: string;
    pricePerDay: number;
    pricePerHour: number;
    store: {
        _id: string;
        name: string;
        address: string;
        contactNumber?: string;
        openingTime: string;
        closingTime: string;
    };
}

interface UserData {
    _id: string;
    name?: string;
    phoneNumber: string;
    email?: string;
}

interface LicenseData {
    frontImageUrl: string;
    backImageUrl: string;
}

function OrderReviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get order details from URL params
    const vehicleId = searchParams.get("vehicleId");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");
    const totalAmount = searchParams.get("totalAmount");

    const [vehicle, setVehicle] = useState<VehicleData | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [license, setLicense] = useState<LicenseData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [confirming, setConfirming] = useState<boolean>(false);
    const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
    const [orderId, setOrderId] = useState<string>("");
    const orderIdRef = useRef<string>(""); // Use ref to avoid closure issues
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);
    const [licenseUpdating, setLicenseUpdating] = useState<boolean>(false);

    // Razorpay integration
    const { isLoaded: razorpayLoaded, isLoading: razorpayProcessing, error: razorpayError, openPaymentModal } = useRazorpay({
        onSuccess: async (response) => {
            console.log("Payment successful!", response);

            // Use ref to get the current orderId (avoids closure issues)
            const currentOrderId = orderIdRef.current;

            if (!currentOrderId) {
                console.error("Order ID not found");
                setError("Failed to confirm order. Order ID missing. Please contact support.");
                setConfirming(false);
                return;
            }

            // Send payment details to backend to confirm order
            try {
                console.log("Sending confirmation request for order:", currentOrderId);
                const confirmResponse = await axiosInstance.post(`/api/v1/orders/${currentOrderId}/confirm`, {
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                });

                console.log("Confirmation response:", confirmResponse.data);

                if (confirmResponse.data.success) {
                    console.log("Order confirmed successfully");
                    setOrderId(currentOrderId); // Set the orderId for display
                    setOrderConfirmed(true);
                    setConfirming(false); // Reset confirming state
                } else {
                    console.error("Confirmation failed:", confirmResponse.data.message);
                    setError(confirmResponse.data.message || "Failed to confirm order. Please contact support.");
                    setConfirming(false);
                }
            } catch (err) {
                const axiosError = err as AxiosError<{ message?: string }>;
                console.error("Error confirming order:", err);
                console.error("Error details:", axiosError.response?.data);
                setError(axiosError.response?.data?.message || "Failed to confirm order. Please contact support.");
                setConfirming(false);
            }
        },
        onFailure: (error) => {
            console.error("Payment failed:", error);
            setError(`Payment failed: ${error.description || "Unknown error"}. Please try again.`);
            setConfirming(false);
        },
        onDismiss: () => {
            console.log("Payment modal dismissed");
            setError("Payment was cancelled. Please complete payment to confirm your order.");
            setConfirming(false);
        },
    });

    useEffect(() => {
        const fetchDetails = async () => {
            // Validate URL params
            if (!vehicleId || !startTime || !endTime || !totalAmount) {
                setError("Missing order details. Please try booking again.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                // Fetch vehicle details
                const vehicleResponse = await axiosInstance.get(`/api/v1/available-vehicles/${vehicleId}`);

                if (!vehicleResponse.data.success || !vehicleResponse.data.data?.vehicle) {
                    setError("Failed to load vehicle details.");
                    setLoading(false);
                    return;
                }

                setVehicle(vehicleResponse.data.data.vehicle);

                // Fetch user profile
                const userResponse = await axiosInstance.get("/api/v1/user/profile");

                if (userResponse.data.success && userResponse.data.data?.user) {
                    setUser(userResponse.data.data.user);
                }

                // Fetch license details with pre-signed URLs
                try {
                    const licenseResponse = await axiosInstance.get("/api/v1/license/details");
                    if (licenseResponse.data.success && licenseResponse.data.data) {
                        setLicense(licenseResponse.data.data);
                    }
                } catch (licenseError) {
                    // License fetch is optional, don't fail the whole page
                    console.log("Could not fetch license:", licenseError);
                }

                setError("");
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

        fetchDetails();
    }, [vehicleId, startTime, endTime, totalAmount]);

    const handleConfirmOrder = async () => {
        if (!vehicleId || !startTime || !endTime || !totalAmount) {
            alert("Missing order details. Please try again.");
            return;
        }

        if (!razorpayLoaded) {
            setError("Payment system is loading. Please wait a moment and try again.");
            return;
        }

        setConfirming(true);
        setError("");

        try {
            // Create order first (this also creates Razorpay order on backend)
            const orderResponse = await axiosInstance.post("/api/v1/orders", {
                vehicleId,
                startTime,
                endTime,
                totalAmount: parseFloat(totalAmount),
            });

            if (orderResponse.data.success && orderResponse.data.data?.orderId && orderResponse.data.data?.razorpayOrderId) {
                const createdOrderId = orderResponse.data.data.orderId;
                const razorpayOrderId = orderResponse.data.data.razorpayOrderId;
                setOrderId(createdOrderId);
                orderIdRef.current = createdOrderId; // Store in ref for callback access

                // Open Razorpay payment modal with the Razorpay order ID
                openPaymentModal({
                    amount: parseFloat(totalAmount) * 100, // Convert to paise
                    currency: "INR",
                    name: "Too Bikes",
                    description: `Bike Rental - ${vehicle?.brand} ${vehicle?.name}`,
                    image: "/logo.png",
                    orderId: razorpayOrderId, // Use Razorpay order ID from backend
                    prefillName: user?.name,
                    prefillEmail: user?.email,
                    notes: {
                        orderId: createdOrderId,
                        vehicleId: vehicleId,
                        vehicleName: `${vehicle?.brand} ${vehicle?.name}`,
                    },
                    themeColor: "#F4AA05",
                });
            } else {
                setError(orderResponse.data.message || "Failed to create order. Please try again.");
                setConfirming(false);
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            let errorMessage = "An error occurred while creating your order.";

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            } else if (axiosError.request) {
                errorMessage = "Network error. Please check your connection.";
            }

            setError(errorMessage);
            setConfirming(false);
        }
    };

    const handleLicenseEdit = () => {
        setIsLicenseModalOpen(true);
    };

    const handleLicenseModalClose = () => {
        setIsLicenseModalOpen(false);
    };

    const handleLicenseComplete = async (frontImage: File, backImage: File) => {
        console.log("License updated:", frontImage.name, backImage.name);
        setIsLicenseModalOpen(false);
        setLicenseUpdating(true);

        try {
            // Refetch license details to get new pre-signed URLs
            const licenseResponse = await axiosInstance.get("/api/v1/license/details");
            if (licenseResponse.data.success && licenseResponse.data.data) {
                setLicense(licenseResponse.data.data);
            }
        } catch (error) {
            console.error("Failed to refresh license details:", error);
        } finally {
            setLicenseUpdating(false);
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
    if (error && !vehicle) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
                <div className="px-4 mt-8">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                            Error Loading Order
                        </h2>
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            {error}
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

    // Order confirmed state
    if (orderConfirmed && orderId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
                <div className="px-4 pt-8">
                    {/* Success Banner */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Order Confirmed!</h1>
                        </div>
                        <p className="text-green-50 text-sm">
                            Your order has been successfully placed
                        </p>
                        <p className="text-green-50 text-xs mt-2 font-mono">
                            Order ID: {orderId}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                // Restore saved query params when returning to home
                                const savedParams = sessionStorage.getItem("homeQueryParams");
                                if (savedParams) {
                                    router.push(`/home?${savedParams}`);
                                } else {
                                    router.push("/home");
                                }
                            }}
                            className="w-full bg-[#F4AA05] hover:bg-[#cf9002] text-white font-semibold py-6 rounded-full shadow-md"
                        >
                            Back to Home
                        </Button>
                        <Button
                            onClick={() => router.push(`/orders/${orderId}`)}
                            variant="outline"
                            className="w-full py-6 rounded-full"
                        >
                            View Order Details
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!vehicle || !startTime || !endTime || !totalAmount) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
            </div>

            {/* Review Header */}
            <div className="px-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Review Your Order</h1>
                    <p className="text-blue-50 text-sm">
                        Please verify all details before confirming
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-4 mb-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Vehicle Details */}
            <div className="px-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Vehicle Details
                </h2>
                <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <Image
                                src={vehicle.image?.[0] || "/bike.png"}
                                alt={`${vehicle.brand} ${vehicle.name}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {vehicle.brand} {vehicle.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {vehicle.fuelType}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                ₹{vehicle.pricePerDay}/day
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
                                {formatDate(startTime)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTime(startTime)}
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
                                {formatDate(endTime)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTime(endTime)}
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
                                {vehicle.store.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {vehicle.store.address}
                            </p>
                        </div>
                    </div>

                    {vehicle.store.contactNumber && (
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {vehicle.store.contactNumber}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vehicle.store.openingTime} - {vehicle.store.closingTime}
                        </p>
                    </div>
                </div>
            </div>

            {/* User Details */}
            {user && (
                <div className="px-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Your Details
                    </h2>
                    <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm space-y-2">
                        {user.name && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Phone</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.phoneNumber}</span>
                        </div>
                        {user.email && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* License Details */}
            {license && (
                <div className="px-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            License Details
                        </h2>
                        <Button
                            onClick={handleLicenseEdit}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            disabled={licenseUpdating}
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </Button>
                    </div>
                    <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-sm relative">
                        {licenseUpdating && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-[#191B27]/80 rounded-2xl flex items-center justify-center z-10">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4AA05] mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Updating license...</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                Driving License
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Front Image */}
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                    Front Side
                                </p>
                                <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <Image
                                        src={license.frontImageUrl}
                                        alt="License Front"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            {/* Back Image */}
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                    Back Side
                                </p>
                                <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <Image
                                        src={license.backImageUrl}
                                        alt="License Back"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            ₹{totalAmount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className="px-4 space-y-3">
                {razorpayError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                        <p className="text-red-600 dark:text-red-400 text-sm">{razorpayError}</p>
                    </div>
                )}
                <Button
                    onClick={handleConfirmOrder}
                    disabled={confirming || razorpayProcessing || !razorpayLoaded}
                    className="w-full bg-[#F4AA05] hover:bg-[#cf9002] text-white font-semibold py-6 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!razorpayLoaded
                        ? "Loading Payment System..."
                        : confirming
                            ? "Creating Order..."
                            : razorpayProcessing
                                ? "Processing Payment..."
                                : "Proceed to Payment"}
                </Button>
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="w-full py-6 rounded-full"
                    disabled={confirming || razorpayProcessing}
                >
                    Go Back
                </Button>
            </div>

            {/* License Upload Modal */}
            <LicenseUploadModal
                isOpen={isLicenseModalOpen}
                onClose={handleLicenseModalClose}
                onComplete={handleLicenseComplete}
            />
        </div>
    );
}

// Wrap with Suspense for Next.js 15 compatibility
export default function OrderReviewPageWrapper() {
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
            <OrderReviewPage />
        </Suspense>
    );
}
