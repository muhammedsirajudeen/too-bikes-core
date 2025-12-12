"use client";

import { useState, useMemo } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PickupSelectorProps {
  pickup: boolean;
  date: Date | null;
  time: string | null;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string | null) => void;
  error?: string;
  minDate?: Date | null; // Minimum date that can be selected (for dropoff validation)
}

export default function PickupSelector({ pickup, date, time, onDateChange, onTimeChange, error, minDate }: PickupSelectorProps) {
  // control both popovers
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  // All available time slots
  const allTimeSlots = [
    "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00",
  ];

  // Filter time slots based on selected date
  const availableTimeSlots = useMemo(() => {
    if (!date) return allTimeSlots;

    const now = new Date();
    const selectedDate = new Date(date);

    // Reset time parts for date comparison
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    // If selected date is today, filter out past times
    if (selectedDateOnly.getTime() === todayDate.getTime()) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      return allTimeSlots.filter((timeSlot) => {
        const [hour, minute] = timeSlot.split(":").map(Number);
        // Keep time slots that are at least 1 hour in the future
        if (hour > currentHour + 1) return true;
        if (hour === currentHour + 1 && minute >= currentMinute) return true;
        return false;
      });
    }

    // If it's a future date, all times are available
    return allTimeSlots;
  }, [date]);

  // Calculate the minimum selectable date
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    // For dropoff, use the later of today or minDate
    if (!pickup && minDate) {
      const minDateCopy = new Date(minDate);
      minDateCopy.setHours(0, 0, 0, 0);
      return minDateCopy > today ? minDateCopy : today;
    }

    // For pickup, use today
    return today;
  };

  return (
    <div className="w-full flex flex-col">
      <div
        className={cn(
          "flex items-center gap-3 md:gap-8 px-6 py-4 rounded-full",
          "bg-white shadow-md border w-full",
          "dark:bg-[#191B27]",
          error
            ? "border-red-500 dark:border-red-500"
            : "border-gray-200 dark:border-gray-700"
        )}
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
                onDateChange(d);
                setOpenDate(false); // 🔥 CLOSE POPUP
              }}
              disabled={{ before: getMinDate() }}
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
            {availableTimeSlots.length === 0 ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                No available time slots for today. Please select a future date.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onTimeChange(t);
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
            )}
          </PopoverContent>
        </Popover>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2 px-2">{error}</p>
      )}
    </div>
  );
}
