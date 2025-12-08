"use client";

import { MapPin, Calendar, SlidersHorizontal } from "lucide-react";

interface PickupFilterBarProps {
  location?: string;
  pickupDate?: string;
  onLocationClick?: () => void;
  onDateClick?: () => void;
  onFilterClick?: () => void;
}

export default function PickupFilterBar({
  location = "Kannur central",
  pickupDate = "Pickup date",
  onLocationClick,
  onDateClick,
  onFilterClick,
}: PickupFilterBarProps) {
  return (
    <div className="relative w-full h-[52px] px-4 flex items-center">
      {/* Main Filter Bar */}
      <div className="relative w-[302px] h-[52px] bg-white dark:bg-[#191B27] rounded-full shadow-[0px_2px_4px_rgba(0,0,0,0.20)] border border-[#DCDCDC] overflow-hidden">
        {/* Vertical Divider Line */}
        <div 
          className="absolute left-[151px] top-[5px] w-[1px] h-[42px] bg-[#DCDCDC]"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'top left' }}
        />

        {/* Location Section - Left */}
        <button
          onClick={onLocationClick}
          className="absolute left-[17.74px] top-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <MapPin className="w-[13.33px] h-[17.01px] text-[#B0B0B0]" fill="#B0B0B0" />
          </div>
          <span className="text-[13px] text-[#8D93A3] font-normal leading-[14px]">
            {location}
          </span>
        </button>

        {/* Date Section - Right */}
        <button
          onClick={onDateClick}
          className="absolute left-[164.48px] top-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Calendar className="w-[15px] h-[15px] text-[#8D93A3]" strokeWidth={1.2} />
          </div>
          <span className="text-[13px] text-[#8D93A3] font-normal leading-[14px]">
            {pickupDate}
          </span>
        </button>
      </div>

      {/* Filter Button - Right */}
      <button
        onClick={onFilterClick}
        className="absolute right-4 top-0 w-[55.18px] h-[52px] bg-white dark:bg-[#191B27] rounded-full border border-black/20 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
        aria-label="Filter options"
      >
        <SlidersHorizontal className="w-[18.5px] h-[16.56px] text-black/50 dark:text-gray-400" strokeWidth={1.5} />
      </button>
    </div>
  );
}

