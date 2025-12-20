"use client";

import axiosInstance from "@/lib/axios";
import axios from "axios";

import { useEffect, useState, useRef } from "react";
import { X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { z } from "zod";
import Msg91Otp from "./msg91.init";

// Type definitions for MSG91 SDK
interface MSG91SuccessData {
    message: string;
    type?: string;
}

interface MSG91ErrorData {
    message?: string;
    type?: string;
}

declare global {
    interface Window {
        sendOtp: (
            identifier: string,
            onSuccess: (data: MSG91SuccessData) => void,
            onError: (error: MSG91ErrorData) => void
        ) => void;
        verifyOtp: (
            otp: number,
            onSuccess: (data: MSG91SuccessData) => void,
            onError: (error: MSG91ErrorData) => void
        ) => void;
        showCaptcha: () => void;
    }
}

// Modal states
type ModalState = "PHONE_INPUT" | "OTP_VERIFICATION";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (phoneNumber: string, otp: string) => void;
    initialPhoneNumber?: string;
}

// Zod schema for Indian phone number
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number");

export default function AuthModal({
    isOpen,
    onClose,
    onComplete,
    initialPhoneNumber = "",
}: AuthModalProps) {
    // State machine
    const [modalState, setModalState] = useState<ModalState>("PHONE_INPUT");

    // Phone input state
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
    const [phoneError, setPhoneError] = useState<string>("");
    const [otpGenerateSuccess, setOtpGenerateSuccess] = useState<string>("");
    const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);

    // OTP state
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState<string>("");
    const [otpSuccess, setOtpSuccess] = useState<string>("");
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [timeLeft, setTimeLeft] = useState(59);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [serverRender, setServerRender] = useState(false)
    // Reset state when modal opens
    useEffect(() => {
        setServerRender(true)
    }, [])
    useEffect(() => {
        if (isOpen) {
            setModalState("PHONE_INPUT");
            setPhoneNumber(initialPhoneNumber);
            setPhoneError("");
            setOtpGenerateSuccess("");
            setOtp(["", "", "", "", "", ""]);
            setOtpError("");
            setOtpSuccess("");
            setTimeLeft(59);
        }
    }, [isOpen, initialPhoneNumber]);

    // Timer countdown for OTP
    useEffect(() => {
        if (!isOpen || modalState !== "OTP_VERIFICATION") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, modalState]);

    // Focus first OTP input when entering OTP state
    useEffect(() => {
        if (modalState === "OTP_VERIFICATION") {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [modalState]);

    // Phone input handlers
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
        if (value.length <= 10) {
            setPhoneNumber(value);
            if (phoneError) setPhoneError(""); // Clear error on type
            if (otpGenerateSuccess) setOtpGenerateSuccess(""); // Clear success message
        }
    };

    const handlePhoneSubmit = async () => {
        try {
            phoneSchema.parse(phoneNumber);
            setIsGeneratingOTP(true);
            setPhoneError("");
            setOtpGenerateSuccess("");

            // MSG91 requires country code without + sign
            const identifierWithCountryCode = `91${phoneNumber}`;
            console.log('Sending OTP to:', identifierWithCountryCode);

            // Automatically trigger CAPTCHA before sending OTP
            if (typeof window.showCaptcha === 'function') {
                console.log('Triggering CAPTCHA automatically...');
                window.showCaptcha();
            } else {
                console.warn('showCaptcha method not available, proceeding without CAPTCHA trigger');
            }

            window.sendOtp(
                identifierWithCountryCode, // Must include country code (91 for India)
                (data) => console.log('OTP sent successfully:', data),
                (error) => {
                    console.error('MSG91 Error:', error);
                    setPhoneError(error.message || 'Failed to send OTP');
                    setIsGeneratingOTP(false);
                }
            );
            // Call API to generate OTP
            // const response = await axiosInstance.post("/api/v1/auth/generate-otp", {
            //     phoneNumber,
            // });

            // const data = response.data;

            // if (!data.success) {
            //     setPhoneError(data.message || "Failed to generate OTP");
            //     return;
            // }

            // Show success message
            setOtpGenerateSuccess("OTP sent successfully to your WhatsApp");

            // Transition to OTP state after a brief delay
            setTimeout(() => {
                setModalState("OTP_VERIFICATION");
                setTimeLeft(59);
            }, 800);
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                setPhoneError(err.issues[0].message);
            } else {
                // Handle Axios error structure
                if (axios.isAxiosError(err) && err.response) {
                    setPhoneError(err.response.data.message || "Failed to generate OTP");
                } else {
                    setPhoneError("Failed to generate OTP. Please try again.");
                }
            }
        } finally {
            setIsGeneratingOTP(false);
        }
    };

    // OTP input handlers
    const handleOTPChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (newOtp.every((digit) => digit !== "") && index === 5) {
            handleOTPSubmit(newOtp.join(""));
        }
    };

    const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOTPPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split("").forEach((char, idx) => {
            if (idx < 6) newOtp[idx] = char;
        });
        setOtp(newOtp);

        // Focus last filled input or first empty
        const lastFilledIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();

        // Auto-submit if complete
        if (pastedData.length === 6) {
            handleOTPSubmit(pastedData);
        }
    };

    const handleOTPSubmit = async (otpValue?: string) => {
        const otpString = otpValue || otp.join("");
        if (otpString.length !== 6) {
            setOtpError("Please enter complete OTP");
            return;
        }

        try {
            setIsVerifyingOTP(true);
            setOtpError("");
            setOtpSuccess("");

            // Wrap MSG91 verifyOtp in a Promise to wait for the callback
            const token = await new Promise<string>((resolve, reject) => {
                window.verifyOtp(
                    parseInt(otpString),
                    (data) => {
                        console.log('OTP verified successfully:', data);
                        // The token is in data.message
                        if (data && data.message) {
                            resolve(data.message);
                        } else {
                            reject(new Error('No token received from MSG91'));
                        }
                    },
                    (error) => {
                        console.error('MSG91 verification error:', error);
                        reject(new Error(error?.message || 'OTP verification failed'));
                    }
                );
            });

            console.log('Received token from MSG91:', token);

            // Call API to verify OTP with the token from MSG91
            const response = await axiosInstance.post("/api/v1/auth/verify-otp", {
                phoneNumber,
                otp: otpString,
                token: token,
            });

            const data = response.data;

            if (!data.success) {
                setOtpError(data.message || "Invalid OTP");
                return;
            }

            // Store access token from response body in localStorage
            if (data.token) {
                localStorage.setItem("auth_token", data.token);
            }
            // Refresh token is automatically stored in HTTP-only cookie by server

            // Show success message
            setOtpSuccess("OTP verified successfully!");

            // Call onComplete after a brief delay
            setTimeout(() => {
                onComplete(phoneNumber, otpString);
            }, 500);
        } catch (err: unknown) {
            // Handle MSG91 errors
            if (err instanceof Error && err.message.includes('MSG91')) {
                setOtpError(err.message);
            }
            // Handle Axios error structure
            else if (axios.isAxiosError(err) && err.response) {
                setOtpError(err.response.data.message || "Failed to verify OTP");
            } else {
                setOtpError("Failed to verify OTP. Please try again.");
            }
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    const handleResend = async () => {
        try {
            setIsGeneratingOTP(true); // Use isGeneratingOTP for resend as well
            setOtpError("");
            setOtpSuccess("");

            // Call API to generate OTP again
            const response = await axiosInstance.post("/api/v1/auth/generate-otp", {
                phoneNumber,
            });

            const data = response.data;

            if (data.success) {
                setTimeLeft(59);
                setOtp(["", "", "", "", "", ""]);
                setOtpSuccess("OTP resent successfully");
                inputRefs.current[0]?.focus();
            } else {
                setOtpError(data.message || "Failed to resend OTP. Please try again.");
            }
        } catch (err: unknown) {
            // Handle Axios error structure
            if (axios.isAxiosError(err) && err.response) {
                setOtpError(err.response.data.message || "Failed to resend OTP");
            } else {
                setOtpError("Failed to resend OTP. Please try again.");
            }
        } finally {
            setIsGeneratingOTP(false);
        }
    };

    const handleBack = () => {
        setModalState("PHONE_INPUT");
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");
    };

    const handleClose = () => {
        setPhoneNumber(initialPhoneNumber);
        setPhoneError("");
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");
        setModalState("PHONE_INPUT");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => !open && handleClose()}
            dismissible={true}
        >
            {
                serverRender && <Msg91Otp />
            }
            <DrawerContent
                className={cn(
                    "max-w-[430px] mx-auto",
                    "bg-white dark:bg-[#191B27] rounded-t-[20px]",
                    "p-0 gap-0",
                    "focus:outline-none"
                )}
            >
                <div className="relative w-full min-h-[502px] bg-white dark:bg-[#191B27] overflow-hidden rounded-t-[20px]">
                    {/* Scooter Image - Always visible */}
                    {/* <div className="absolute left-0 top-[299px] w-full h-[217px] pointer-events-none z-0">
                        <Image
                            src="/modalImage.png"
                            alt="Scooter illustration"
                            fill
                            className="object-cover"
                            sizes="430px"
                            priority
                        />
                    </div> */}

                    {/* Close Button */}
                    <DrawerClose
                        onClick={handleClose}
                        className={cn(
                            "absolute top-4 right-4 w-6 h-6 rounded-full z-20",
                            "text-[#99A1AF] hover:text-gray-600 dark:hover:text-gray-300",
                            "transition-colors focus:outline-none"
                        )}
                    >
                        <X className="w-full h-full" />
                        <span className="sr-only">Close</span>
                    </DrawerClose>

                    {/* Back Button - Only visible in OTP state */}
                    {modalState === "OTP_VERIFICATION" && (
                        <button
                            onClick={handleBack}
                            className={cn(
                                "absolute top-4 left-4 w-8 h-8 rounded-full z-20",
                                "flex items-center justify-center",
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                                "transition-all focus:outline-none"
                            )}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="sr-only">Back</span>
                        </button>
                    )}

                    {/* Content Container with smooth transitions */}
                    <div className="relative z-10">
                        {/* Phone Input State */}
                        <div
                            className={cn(
                                "absolute inset-0 transition-all duration-300 ease-in-out",
                                "flex flex-col justify-between items-center",
                                "px-6 pt-6 pb-12",
                                modalState === "PHONE_INPUT"
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 -translate-x-full pointer-events-none"
                            )}
                        >
                            {/* Header and Form Content */}
                            <div className="w-full max-w-[358px] flex flex-col gap-6">
                                {/* Header Content */}
                                <div className="flex flex-col gap-3">
                                    <DrawerTitle asChild>
                                        <h2 className="text-2xl font-medium text-[#111111] dark:text-white">
                                            Start your ride
                                        </h2>
                                    </DrawerTitle>
                                    <p className="text-[15px] font-normal text-black/75 dark:text-gray-400">
                                        Enter your WhatsApp number to login.
                                    </p>
                                </div>

                                {/* Input Field Container */}
                                <div className="w-full flex flex-col gap-2">
                                    <label
                                        htmlFor="phone-number"
                                        className="text-sm font-medium text-[#0B0B0B] dark:text-gray-300"
                                    >
                                        Number
                                    </label>

                                    {/* Phone Input */}
                                    <div
                                        className={cn(
                                            "w-full h-[54px] bg-white dark:bg-[#20222F] rounded-lg flex items-center overflow-hidden border-2 transition-all",
                                            phoneError ? "border-red-500" : "border-gray-200 dark:border-gray-700 focus-within:border-[#F4AA05]"
                                        )}
                                    >
                                        {/* Flag and Code Section */}
                                        <div className="flex items-center gap-2 px-4 border-r border-gray-200 dark:border-gray-700 h-full bg-white dark:bg-[#252836]">
                                            {/* Indian Flag SVG */}
                                            <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 rounded-[2px] shadow-sm">
                                                <rect width="20" height="15" fill="white" />
                                                <rect width="20" height="5" fill="#FF9933" />
                                                <rect y="10" width="20" height="5" fill="#138808" />
                                                <circle cx="10" cy="7.5" r="2" fill="none" stroke="#000080" strokeWidth="0.5" />
                                                <circle cx="10" cy="7.5" r="0.4" fill="#000080" />
                                                <path d="M10 7.5 L10 5.5 M10 7.5 L12 7.5 M10 7.5 L10 9.5 M10 7.5 L8 7.5 M10 7.5 L11.4 6.1 M10 7.5 L11.4 8.9 M10 7.5 L8.6 8.9 M10 7.5 L8.6 6.1" stroke="#000080" strokeWidth="0.2" />
                                            </svg>
                                            <span className="text-base font-semibold text-gray-700 dark:text-gray-200">+91</span>
                                        </div>

                                        {/* Input Area */}
                                        <input
                                            id="phone-number"
                                            type="tel"
                                            inputMode="numeric"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            placeholder=""
                                            className={cn(
                                                "flex-1 bg-transparent outline-none px-4",
                                                "text-lg font-mono font-medium tracking-wider",
                                                "text-gray-900 dark:text-white",
                                                "placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            )}
                                            maxLength={10}
                                        />
                                    </div>

                                    {/* Validation Error */}
                                    {phoneError && (
                                        <p className="text-xs text-red-500 animate-in slide-in-from-top-1 px-1">
                                            {phoneError}
                                        </p>
                                    )}

                                    {/* Success Message */}
                                    {otpGenerateSuccess && (
                                        <p className="text-xs text-green-600 dark:text-green-500 animate-in slide-in-from-top-1 px-1">
                                            {otpGenerateSuccess}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button - Aligned to bottom center */}
                            <Button
                                onClick={handlePhoneSubmit}
                                disabled={phoneNumber.length < 10 || isGeneratingOTP}
                                className="w-full max-w-[358px] bg-[#F4AA05] hover:bg-[#cf9002] text-white font-semibold text-lg px-8 py-6 rounded-full shadow-lg shadow-orange-500/20 mt-8 h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingOTP ? "Generating..." : "Generate OTP"}
                            </Button>
                        </div>

                        {/* OTP Verification State */}
                        <div
                            className={cn(
                                "absolute inset-0 transition-all duration-300 ease-in-out",
                                modalState === "OTP_VERIFICATION"
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 translate-x-full pointer-events-none"
                            )}
                        >
                            <div className="relative w-full flex flex-col gap-6 p-6 pt-16">
                                {/* Header */}
                                <div className="flex flex-col gap-3">
                                    <DrawerTitle asChild>
                                        <h2 className="text-2xl font-medium text-[#111111] dark:text-white">
                                            Verify your account
                                        </h2>
                                    </DrawerTitle>
                                    <p className="text-[15px] font-normal text-black/75 dark:text-gray-400">
                                        Enter the OTP we sent to your Whatsapp.
                                    </p>
                                </div>

                                {/* OTP Input Boxes */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => {
                                                    inputRefs.current[index] = el;
                                                }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOTPChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                                onPaste={index === 0 ? handleOTPPaste : undefined}
                                                className={cn(
                                                    "w-full aspect-square rounded-2xl",
                                                    "text-center text-2xl font-semibold",
                                                    "border-2 transition-all",
                                                    "focus:outline-none focus:ring-0",
                                                    digit
                                                        ? "border-[#F4AA05] bg-[#FFF8E7] dark:bg-[#2A2416] text-gray-900 dark:text-white"
                                                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#20222F] text-gray-900 dark:text-white",
                                                    "hover:border-[#F4AA05]/50",
                                                    otpError && "border-red-500"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    {/* Error Message */}
                                    {otpError && (
                                        <p className="text-sm text-red-500 text-center animate-in slide-in-from-top-1">
                                            {otpError}
                                        </p>
                                    )}

                                    {/* Success Message */}
                                    {otpSuccess && (
                                        <p className="text-sm text-green-600 dark:text-green-500 text-center animate-in slide-in-from-top-1">
                                            {otpSuccess}
                                        </p>
                                    )}
                                </div>

                                {/* Timer and Resend */}
                                <div className="text-center">
                                    {timeLeft > 0 ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Code expires in: <span className="font-semibold text-[#F4AA05]">{timeLeft}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleResend}
                                            className="text-sm font-medium text-[#F4AA05] hover:text-[#e5a525] transition-colors"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={() => handleOTPSubmit()}
                                    disabled={otp.some((digit) => digit === "") || isVerifyingOTP}
                                    className="w-full bg-[#F4AA05] hover:bg-[#cf9002] text-white font-semibold text-lg px-8 py-6 rounded-full shadow-lg shadow-orange-500/20 h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isVerifyingOTP ? "Verifying..." : "Verify OTP"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Image - Full Width at Absolute Bottom */}
                <div className="w-full relative">
                    <Image
                        src="/modalImage.png"
                        alt="Auth modal decoration"
                        height={400}
                        width={1920}
                        className="w-full h-auto"
                        // fill
                        priority
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
