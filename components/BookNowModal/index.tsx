"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneNumber: string) => void;
  phoneNumber?: string;
}

const emptySubscribe = () => () => {};

export default function BookNowModal({
  isOpen,
  onClose,
  onSubmit,
  phoneNumber: initialPhoneNumber = "",
}: BookNowModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialPhoneNumber, setPrevInitialPhoneNumber] = useState(initialPhoneNumber);

  if (isOpen !== prevIsOpen || initialPhoneNumber !== prevInitialPhoneNumber) {
    setPrevIsOpen(isOpen);
    setPrevInitialPhoneNumber(initialPhoneNumber);
    if (isOpen) {
      setPhoneNumber(initialPhoneNumber);
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric values
    if (value === "" || /^\d+$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = () => {
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
          "focus:outline-none",
          "data-vaul-drawer:transition-transform data-vaul-drawer:duration-2000 data-vaul-drawer:ease-out"
        )}
      >
        <div className="relative w-full h-[502px] bg-white dark:bg-[#191B27] overflow-hidden rounded-t-[20px]">
          {/* Scooter Image - Positioned absolutely at top 299px */}
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
              "transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0",
              "disabled:pointer-events-none"
            )}
          >
            <X className="w-full h-full" />
            <span className="sr-only">Close</span>
          </DrawerClose>

          {/* Header Content */}
          <div className="absolute left-4 top-6 flex flex-col gap-3 z-10">
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
              onClick={handleSubmit}
              disabled={phoneNumber.trim().length < 10}
              className={cn(
                "w-[140px] h-11 px-[45px] py-[18px] bg-[#F7B638] hover:bg-[#e5a525]",
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
      </DrawerContent>
    </Drawer>
  );
}