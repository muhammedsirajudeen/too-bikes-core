"use client";

import ReviewCard from "./ReviewCard";

interface Review {
  userName: string;
  rating: number;
  comment: string;
  date?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="bg-[#F4AA05] rounded-3xl p-6 mx-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          What Riders Say
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {reviews.map((review, index) => (
            <ReviewCard
              key={index}
              userName={review.userName}
              rating={review.rating}
              comment={review.comment}
              date={review.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


