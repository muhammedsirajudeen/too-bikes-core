"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (otp: string) => void;
    phoneNumber: string;
}

export default function OTPModal({
    isOpen,
    onClose,
    onSubmit,
    phoneNumber,
}: OTPModalProps) {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState(59);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer countdown
    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setOtp(["", "", "", "", "", ""]);
            setError("");
            setTimeLeft(59);
            // Focus first input
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (newOtp.every((digit) => digit !== "") && index === 5) {
            handleSubmit(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
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
            handleSubmit(pastedData);
        }
    };

    const handleSubmit = (otpValue?: string) => {
        const otpString = otpValue || otp.join("");
        if (otpString.length !== 6) {
            setError("Please enter complete OTP");
            return;
        }
        onSubmit(otpString);
    };

    const handleClose = () => {
        setOtp(["", "", "", "", "", ""]);
        setError("");
        setTimeLeft(59);
        onClose();
    };

    const handleResend = () => {
        setTimeLeft(59);
        setOtp(["", "", "", "", "", ""]);
        setError("");
        inputRefs.current[0]?.focus();
        // TODO: Trigger resend OTP API call
    };

    if (!isOpen) return null;

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => !open && handleClose()}
            dismissible={true}
        >
            <DrawerContent
                className={cn(
                    "max-w-[430px] mx-auto",
                    "bg-white dark:bg-[#191B27] rounded-t-[20px]",
                    "p-6 gap-0",
                    "focus:outline-none"
                )}
            >
                <div className="relative w-full flex flex-col gap-6">
                    {/* Close Button */}
                    <DrawerClose
                        onClick={handleClose}
                        className={cn(
                            "absolute -top-2 -right-2 w-8 h-8 rounded-full z-20",
                            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                            "transition-colors focus:outline-none"
                        )}
                    >
                        <X className="w-full h-full" />
                        <span className="sr-only">Close</span>
                    </DrawerClose>

                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <DrawerTitle asChild>
                            <h2 className="text-3xl font-medium text-[#111111] dark:text-white">
                                Verify your account
                            </h2>
                        </DrawerTitle>
                        <p className="text-base text-gray-600 dark:text-gray-400">
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
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className={cn(
                                        "w-full aspect-square rounded-2xl",
                                        "text-center text-2xl font-semibold",
                                        "border-2 transition-all",
                                        "focus:outline-none focus:ring-0",
                                        digit
                                            ? "border-[#F4AA05] bg-[#FFF8E7] dark:bg-[#2A2416] text-gray-900 dark:text-white"
                                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#20222F] text-gray-900 dark:text-white",
                                        "hover:border-[#F4AA05]/50",
                                        error && "border-red-500"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-sm text-red-500 text-center animate-in slide-in-from-top-1">
                                {error}
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
                    <button
                        onClick={() => handleSubmit()}
                        disabled={otp.some((digit) => digit === "")}
                        className={cn(
                            "w-full h-14 bg-[#F7B638] hover:bg-[#e5a525]",
                            "rounded-full shadow-lg shadow-orange-500/20",
                            "flex items-center justify-center",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                            "transition-all active:scale-[0.98]"
                        )}
                    >
                        <span className="text-xl font-light text-white tracking-wide">
                            Verify OTP
                        </span>
                    </button>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
