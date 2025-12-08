"use client";

import PickupDropCard from "./PickupDropCard";
import VerticalTimeline from "./VerticalTimeline";

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

      <div className="flex gap-4">
        {/* Pickup Card */}
        <div className="flex-1">
          <PickupDropCard
            type="pickup"
            date={pickupDate}
            time={pickupTime}
            location={pickupLocation}
          />
        </div>

        {/* Vertical Timeline */}
        <VerticalTimeline className="h-full min-h-[200px] my-2" />

        {/* Drop Card */}
        <div className="flex-1">
          <PickupDropCard
            type="drop"
            date={dropDate}
            time={dropTime}
            location={dropLocation}
          />
        </div>
      </div>
    </div>
  );
}

