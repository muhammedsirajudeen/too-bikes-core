"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth.context";

// Razorpay types
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    handler?: (response: RazorpaySuccessResponse) => void;
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: any) => void) => void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface UseRazorpayOptions {
    onSuccess?: (response: RazorpaySuccessResponse) => void;
    onFailure?: (error: any) => void;
    onDismiss?: () => void;
}

export function useRazorpay(options?: UseRazorpayOptions) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { phoneNumber } = useAuth();

    // Load Razorpay script
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if already loaded
        if (window.Razorpay) {
            setIsLoaded(true);
            return;
        }

        // Check if script is already in DOM
        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existingScript) {
            existingScript.addEventListener("load", () => setIsLoaded(true));
            return;
        }

        // Load script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => {
            setIsLoaded(true);
        };

        script.onerror = () => {
            setError("Failed to load Razorpay SDK");
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup if needed
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    const openPaymentModal = useCallback(
        (paymentOptions: {
            amount: number;
            currency?: string;
            name: string;
            description?: string;
            image?: string;
            orderId?: string;
            prefillName?: string;
            prefillEmail?: string;
            notes?: Record<string, string>;
            themeColor?: string;
        }) => {
            if (!isLoaded) {
                setError("Razorpay SDK not loaded yet");
                return;
            }

            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
            if (!razorpayKey) {
                setError("Razorpay key not configured");
                return;
            }

            setIsLoading(true);
            setError(null);

            const razorpayOptions: RazorpayOptions = {
                key: razorpayKey,
                amount: paymentOptions.amount, // Amount in paise (smallest currency unit)
                currency: paymentOptions.currency || "INR",
                name: paymentOptions.name,
                description: paymentOptions.description,
                image: paymentOptions.image,
                order_id: paymentOptions.orderId,
                prefill: {
                    name: paymentOptions.prefillName,
                    email: paymentOptions.prefillEmail,
                    contact: phoneNumber || undefined, // Use phone number from auth context
                },
                notes: paymentOptions.notes,
                theme: {
                    color: paymentOptions.themeColor || "#F4AA05",
                },
                handler: (response: RazorpaySuccessResponse) => {
                    setIsLoading(false);
                    options?.onSuccess?.(response);
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        options?.onDismiss?.();
                    },
                },
            };

            try {
                const razorpayInstance = new window.Razorpay(razorpayOptions);

                // Handle payment failure
                razorpayInstance.on("payment.failed", (response: any) => {
                    setIsLoading(false);
                    options?.onFailure?.(response.error);
                });

                // Open the payment modal
                razorpayInstance.open();
            } catch (err) {
                setIsLoading(false);
                setError("Failed to open Razorpay modal");
                options?.onFailure?.(err);
            }
        },
        [isLoaded, phoneNumber, options]
    );

    return {
        isLoaded,
        isLoading,
        error,
        openPaymentModal,
    };
}
