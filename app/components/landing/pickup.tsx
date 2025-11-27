"use client";

import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function PickupSelector({pickup}:{pickup:boolean}) {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);

  return (
    <div className="w-full flex justify-center">
      <div className="
        flex items-center gap-6 px-6 py-3 rounded-full
        bg-white shadow-md border border-gray-200 min-w-[98%]
      ">
        {/* DATE PICKER */}
        <Popover>
          <PopoverTrigger className="flex items-center gap-2 text-gray-500 cursor-pointer">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <span className="select-none text-sm text-nowrap">
              {date ? format(date, "PPP") : pickup ? "Select Pickup date" : "Select Drop date"}
            </span>
          </PopoverTrigger>

          <PopoverContent className="p-0">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={(d) => d && setDate(d)}
            />
          </PopoverContent>
        </Popover>

        {/* VERTICAL DIVIDER */}
        <div className="w-px h-8 bg-gray-300" />

        {/* TIME PICKER */}
        <Popover>
          <PopoverTrigger className="flex items-center gap-2 text-gray-500 cursor-pointer">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="select-none text-sm text-nowrap">
              {time ?? pickup ? "Select Pickup time" : "Select Dropoff time"}
            </span>
          </PopoverTrigger>

          <PopoverContent className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                "09:00", "10:00", "11:00",
                "12:00", "13:00", "14:00",
                "15:00", "16:00", "17:00",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm border",
                    time === t
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300"
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
