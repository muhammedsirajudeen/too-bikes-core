"use client";

import { Star } from "lucide-react";

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment: string;
  date?: string;
}

export default function ReviewCard({
  userName,
  rating,
  comment,
  date,
}: ReviewCardProps) {
  return (
    <div className="min-w-[280px] bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {userName}
          </h4>
          {date && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {date}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating
                  ? "fill-[#F4AA05] text-[#F4AA05]"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
        {comment}
      </p>
    </div>
  );
}


