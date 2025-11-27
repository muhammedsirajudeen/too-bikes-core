"use client";

import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function PickupSelector({ pickup }: { pickup: boolean }) {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // control both popovers
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  return (
    <div className="w-full flex justify-center">
      <div
        className="
          flex items-center gap-3 md:gap-8 px-6 py-4 rounded-full
          bg-white shadow-md border border-gray-200 w-full
          dark:bg-[#191B27] dark:border-gray-700
        "
      >
        {/* DATE PICKER */}
        <Popover open={openDate} onOpenChange={setOpenDate}>
          <PopoverTrigger className="flex items-center gap-3 cursor-pointer">
            <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />

            <span className="select-none text-sm whitespace-normal break-words text-left text-gray-700 dark:text-gray-200">
              {date
                ? format(date, "PPP")
                : pickup
                ? "Select Pickup date"
                : "Select Drop date"}
            </span>
          </PopoverTrigger>

          <PopoverContent className="p-0 dark:bg-[#191B27] dark:border-gray-700">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={(d) => {
                if (!d) return;
                setDate(d);
                setOpenDate(false); // 🔥 CLOSE POPUP
              }}
              className="dark:bg-[#191B27] dark:text-white"
            />
          </PopoverContent>
        </Popover>

        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

        {/* TIME PICKER */}
        <Popover open={openTime} onOpenChange={setOpenTime}>
          <PopoverTrigger className="flex items-center gap-3 cursor-pointer">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />

            <span className="select-none text-xs whitespace-normal break-words text-left text-gray-700 dark:text-gray-200">
              {time
                ? time
                : pickup
                ? "Select Pickup time"
                : "Select Dropoff time"}
            </span>
          </PopoverTrigger>

          <PopoverContent className="p-3 dark:bg-[#191B27] dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2">
              {[
                "09:00", "10:00", "11:00",
                "12:00", "13:00", "14:00",
                "15:00", "16:00", "17:00",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTime(t);
                    setOpenTime(false); // 🔥 CLOSE POPUP
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm border transition",
                    time === t
                      ? "bg-black text-white border-black dark:bg-white dark:text-black"
                      : "bg-white text-gray-700 border-gray-300 dark:bg-[#2A2D3A] dark:text-gray-200 dark:border-gray-600"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
