"use client";

import PickupDropCard from "./PickupDropCard";

interface PickupDropSectionProps {
  pickupDate: Date | string;
  pickupTime: string;
  pickupLocation: string;
  dropDate: Date | string;
  dropTime: string;
  dropLocation: string;
}

export default function PickupDropSection({
  pickupDate,
  pickupTime,
  pickupLocation,
  dropDate,
  dropTime,
  dropLocation,
}: PickupDropSectionProps) {
  return (
    <div className="px-4 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Pickup & Drop details
      </h2>

      <div className="flex flex-col gap-4">
        {/* Pickup Card */}
        <PickupDropCard
          type="pickup"
          date={pickupDate}
          time={pickupTime}
          location={pickupLocation}
        />

        {/* Vertical Timeline - Horizontal line between cards */}
        <div className="flex items-center justify-center my-2">
          <div className="flex items-center w-full">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <div 
              className="flex-1 h-0.5 mx-2"
              style={{
                background: "repeating-linear-gradient(to right, #10b981 0px, #10b981 4px, transparent 4px, transparent 8px)",
                backgroundSize: "8px 2px"
              }}
            />
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
          </div>
        </div>

        {/* Drop Card */}
        <PickupDropCard
          type="drop"
          date={dropDate}
          time={dropTime}
          location={dropLocation}
        />
      </div>
    </div>
  );
}

