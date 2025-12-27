"use client";

import { Button } from "@/components/ui/button";

interface BottomCTAProps {
  totalRent: number;
  onBookNow: () => void;
}

export default function BottomCTA({ totalRent, onBookNow }: BottomCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#191B27] border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-4 max-w-[430px] mx-auto">
        <div>
          <p className="text-sm text-black dark:text-gray-400">Total Rent</p>
          <p className="text-2xl font-bold text-black dark:text-white">

            ₹{totalRent}
          </p>
        </div>
        <Button
          onClick={onBookNow}
          className="bg-[#F4AA05] hover:bg-[#cf9002] text-white font-semibold text-lg px-8 py-6 rounded-full shadow-md"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}


