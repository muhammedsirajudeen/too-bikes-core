"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface PickupDropCardProps {
  type: "pickup" | "drop";
  date: Date | string;
  time: string;
  location: string;
}

export default function PickupDropCard({
  type,
  date,
  time,
  location,
}: PickupDropCardProps) {
  const isPickup = type === "pickup";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const formattedDate = format(dateObj, "MMM dd, yyyy");

  return (
    <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`h-2 w-2 rounded-full ${
            isPickup ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
          {type}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {time}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}

