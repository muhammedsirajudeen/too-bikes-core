/**
 * Example: How to use the useRazorpay hook
 * 
 * This example demonstrates how to integrate Razorpay payments
 * in your components using the custom useRazorpay hook.
 */

"use client";

import { useRazorpay } from "@/hooks/useRazorpay";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PaymentExample() {
    const [paymentStatus, setPaymentStatus] = useState<string>("");

    const { isLoaded, isLoading, error, openPaymentModal } = useRazorpay({
        onSuccess: (response) => {
            console.log("Payment successful!", response);
            setPaymentStatus(`Payment successful! ID: ${response.razorpay_payment_id}`);

            // Here you can:
            // 1. Send payment details to your backend for verification
            // 2. Update order status
            // 3. Show success message to user
        },
        onFailure: (error) => {
            console.error("Payment failed:", error);
            setPaymentStatus(`Payment failed: ${error.description || "Unknown error"}`);
        },
        onDismiss: () => {
            console.log("Payment modal dismissed");
            setPaymentStatus("Payment cancelled by user");
        },
    });

    const handlePayment = () => {
        // Open Razorpay payment modal
        openPaymentModal({
            amount: 50000, // Amount in paise (₹500.00)
            currency: "INR",
            name: "Too Bikes",
            description: "Bike Rental Payment",
            image: "/logo.png", // Optional: Your company logo
            // orderId: "order_xyz123", // Optional: If you have a backend order ID
            prefillName: "Customer Name", // Optional
            prefillEmail: "customer@example.com", // Optional
            notes: {
                // Optional: Any custom notes
                bookingId: "BOOK123",
                vehicleType: "Scooter",
            },
            themeColor: "#F4AA05", // Optional: Customize theme color
        });
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Razorpay Payment Example</h1>

            {!isLoaded && <p className="text-gray-600 mb-4">Loading Razorpay...</p>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {paymentStatus && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                    {paymentStatus}
                </div>
            )}

            <Button
                onClick={handlePayment}
                disabled={!isLoaded || isLoading}
                className="w-full bg-[#F4AA05] hover:bg-[#cf9002] text-white"
            >
                {isLoading ? "Processing..." : "Pay ₹500"}
            </Button>

            <div className="mt-6 p-4 bg-gray-100 rounded">
                <h2 className="font-semibold mb-2">How it works:</h2>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>User must be authenticated (phone number is auto-filled)</li>
                    <li>Click the payment button to open Razorpay modal</li>
                    <li>Complete payment using test credentials</li>
                    <li>Success/failure callbacks are triggered</li>
                </ol>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-semibold text-sm mb-2">Test Mode Credentials:</h3>
                <p className="text-xs">Card: 4111 1111 1111 1111</p>
                <p className="text-xs">CVV: Any 3 digits</p>
                <p className="text-xs">Expiry: Any future date</p>
            </div>
        </div>
    );
}
