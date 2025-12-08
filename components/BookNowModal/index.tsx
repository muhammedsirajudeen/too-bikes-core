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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
            "bg-white dark:bg-[#191B27] rounded-t-[20px] shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "duration-300 ease-out",
            "focus:outline-none"
          )}
          onEscapeKeyDown={handleClose}
          onPointerDownOutside={handleClose}
        >
          <div className="relative w-full h-[502px] bg-white dark:bg-[#191B27] overflow-hidden rounded-t-[20px]">
            {/* Scooter Image - Positioned absolutely at top 299px */}
            <div className="absolute left-0 top-[299px] w-full h-[217px] pointer-events-none">
              <Image
                src="/loginImage.png"
                alt="Scooter illustration"
                fill
                className="object-cover"
                sizes="430px"
                priority
              />
            </div>

            {/* Close Button */}
            <DialogPrimitive.Close
              onClick={handleClose}
              className={cn(
                "absolute top-4 right-4 w-6 h-6 rounded-full z-20",
                "text-[#99A1AF] hover:text-gray-600 dark:hover:text-gray-300",
                "transition-colors focus:outline-none"
              )}
            >
              <X className="w-full h-full" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Header Content */}
            <div className="absolute left-4 top-6 flex flex-col gap-3 z-10">
              <DialogPrimitive.Title asChild>
                <h2 className="text-2xl font-medium text-[#111111] dark:text-white leading-[30px]">
                  Start your ride
                </h2>
              </DialogPrimitive.Title>
              <p className="text-[15px] font-normal text-black/75 dark:text-gray-400 leading-[18.75px]">
                Enter your WhatsApp number to login.
              </p>
            </div>

            {/* Form Content */}
            <div className="absolute left-4 top-[121px] w-[358px] flex flex-col items-center gap-6 z-10">
              {/* Input Field */}
              <div className="w-full flex flex-col gap-3">
                <label
                  htmlFor="phone-number"
                  className="text-sm font-medium text-[#0B0B0B] dark:text-gray-300 leading-5"
                >
                  Number
                </label>
                <div className="w-full h-[54px] px-3 py-1 bg-white dark:bg-[#0B0A1B] rounded-lg border border-[#E5E5E5] dark:border-gray-700 shadow-sm flex items-center">
                  <input
                    id="phone-number"
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter number"
                    className={cn(
                      "flex-1 bg-transparent outline-none",
                      "text-base text-gray-900 dark:text-white leading-6",
                      "placeholder:text-[#737373] dark:placeholder:text-gray-500"
                    )}
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (phoneNumber.trim().length >= 10) {
                    onSubmit(phoneNumber.trim());
                  }
                }}
                disabled={phoneNumber.trim().length < 10}
                className={cn(
                  "w-[140px] h-[44px] px-[45px] py-[18px] bg-[#F7B638] hover:bg-[#e5a525]",
                  "rounded-full shadow-md",
                  "flex flex-col justify-center items-center",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all"
                )}
              >
                <span className="text-sm font-semibold text-white leading-[17.5px]">
                  Button
                </span>
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}