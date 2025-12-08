"use client";

import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneNumber: string) => void;
  phoneNumber?: string;
}

export default function BookNowModal({
  isOpen,
  onClose,
  onSubmit,
  phoneNumber: initialPhoneNumber = "",
}: BookNowModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPhoneNumber(initialPhoneNumber);
    }
  }, [isOpen, initialPhoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric values
    if (value === "" || /^\d+$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim().length >= 10) {
      onSubmit(phoneNumber.trim());
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    onClose();
  };

  if (!isMounted) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Modal Content - Bottom Sheet */}
        <DialogPrimitive.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 w-full max-w-[430px] mx-auto",
            "bg-white dark:bg-[#191B27] rounded-t-[30px] shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "duration-300 ease-out",
            "focus:outline-none"
          )}
          onEscapeKeyDown={handleClose}
          onPointerDownOutside={handleClose}
        >
          <div className="relative flex flex-col p-6 pb-8">
            {/* Close Button */}
            <DialogPrimitive.Close
              onClick={handleClose}
              className={cn(
                "absolute top-6 right-6 rounded-full p-1.5",
                "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4AA05] focus:ring-offset-2"
              )}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Content */}
            <div className="flex flex-col pt-2 pb-4">
              {/* Heading */}
              <DialogPrimitive.Title asChild>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Start your ride
                </h2>
              </DialogPrimitive.Title>

              {/* Subtext */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter your WhatsApp number to login.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                {/* Input Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone-number"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Number
                  </label>
                  <input
                    id="phone-number"
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter number"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border",
                      "bg-white dark:bg-[#0B0A1B]",
                      "border-gray-200 dark:border-gray-700",
                      "text-gray-900 dark:text-white",
                      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                      "focus:outline-none focus:ring-2 focus:ring-[#F4AA05] focus:border-transparent",
                      "transition-all"
                    )}
                    maxLength={15}
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={phoneNumber.trim().length < 10}
                  className={cn(
                    "w-full bg-[#F4AA05] hover:bg-[#cf9002]",
                    "text-black font-semibold text-lg",
                    "px-6 py-4 rounded-full shadow-md",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all"
                  )}
                >
                  Button
                </Button>
              </form>
            </div>

            {/* Scooter Image - Aligned at bottom */}
            <div className="flex justify-start mt-6 pt-4">
              <div className="relative w-40 h-28">
                <Image
                  src="/bike.png"
                  alt="Scooter illustration"
                  fill
                  className="object-contain object-left"
                  sizes="160px"
                />
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

