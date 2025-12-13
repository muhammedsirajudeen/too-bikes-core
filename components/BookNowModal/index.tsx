"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { z } from "zod";

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneNumber: string) => void;
  phoneNumber?: string;
}

// Zod schema for Indian phone number
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number");

export default function BookNowModal({
  isOpen,
  onClose,
  onSubmit,
  phoneNumber: initialPhoneNumber = "",
}: BookNowModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [error, setError] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setPhoneNumber(initialPhoneNumber);
      setError("");
    }
  }, [isOpen, initialPhoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      if (error) setError(""); // Clear error on type
    }
  };

  const handleSubmit = () => {
    try {
      phoneSchema.parse(phoneNumber);
      onSubmit(phoneNumber);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      }
    }
  };

  const handleClose = () => {
    setPhoneNumber(initialPhoneNumber);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      dismissible={true}
      snapPoints={[1]}
    >
      <DrawerContent
        className={cn(
          "max-w-[430px] mx-auto",
          "bg-white dark:bg-[#191B27] rounded-t-[20px]",
          "p-0 gap-0",
          "focus:outline-none"
        )}
      >
        <div className="relative w-full h-[502px] bg-white dark:bg-[#191B27] overflow-hidden rounded-t-[20px]">
          {/* Scooter Image */}
          <div className="absolute left-0 top-[299px] w-full h-[217px] pointer-events-none">
            <Image
              src="/modalImage.png"
              alt="Scooter illustration"
              fill
              className="object-cover"
              sizes="430px"
              priority
            />
          </div>

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

          {/* Header Content */}
          <div className="absolute left-4 top-6 flex flex-col gap-3 z-10 w-[358px]">
            <DrawerTitle asChild>
              <h2 className="text-2xl font-medium text-[#111111] dark:text-white leading-[30px]">
                Start your ride
              </h2>
            </DrawerTitle>
            <p className="text-[15px] font-normal text-black/75 dark:text-gray-400 leading-[18.75px]">
              Enter your WhatsApp number to login.
            </p>
          </div>

          {/* Form Content */}
          <div className="absolute left-4 top-[121px] w-[358px] flex flex-col items-center gap-6 z-10">
            {/* Input Field Container */}
            <div className="w-full flex flex-col gap-3">
              <label
                htmlFor="phone-number"
                className="text-sm font-medium text-[#0B0B0B] dark:text-gray-300 leading-5"
              >
                Number
              </label>

              {/* Modded Bar-Bar-Bar UI Input */}
              <div
                className={cn(
                  "w-full h-[54px] bg-[#F5F5F5] dark:bg-[#20222F] rounded-xl flex items-center overflow-hidden border transition-all",
                  error ? "border-red-500" : "border-transparent focus-within:border-[#F4AA05]"
                )}
              >
                {/* Flag and Code Section */}
                <div className="flex items-center gap-2 px-4 border-r border-gray-300 dark:border-gray-700 h-full bg-gray-50 dark:bg-[#252836]">
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
                  placeholder="xxxxx xxxxx"
                  className={cn(
                    "flex-1 bg-transparent outline-none px-4",
                    "text-lg font-mono font-medium tracking-wider", // Use mono font for bar-bar-bar feel
                    "text-gray-900 dark:text-white",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  )}
                  maxLength={10}
                />
              </div>

              {/* Validation Error */}
              {error && (
                <p className="text-xs text-red-500 animate-in slide-in-from-top-1 px-1">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={phoneNumber.length < 10}
              className={cn(
                "w-full h-14 bg-[#F7B638] hover:bg-[#e5a525]",
                "rounded-full shadow-lg shadow-orange-500/20",
                "flex flex-col justify-center items-center mt-4",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                "transition-all active:scale-[0.98]"
              )}
            >
              <span className="text-xl font-light text-white tracking-wide">
                Verify OTP
              </span>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}