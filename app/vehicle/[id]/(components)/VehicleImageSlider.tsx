"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Share2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface VehicleImageSliderProps {
  images: string[];
  vehicleName: string;
  onBack?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}

export default function VehicleImageSlider({
  images,
  vehicleName,
  onBack,
  isFavorite = false,
  onFavoriteToggle,
}: VehicleImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const scrollWidth = scrollContainerRef.current.scrollWidth;
      const slideWidth = scrollWidth / images.length;
      scrollContainerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
    }
    setCurrentIndex(index);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const scrollWidth = scrollContainerRef.current.scrollWidth;
      const slideWidth = scrollWidth / images.length;
      const newIndex = Math.round(scrollLeft / slideWidth);
      setCurrentIndex(newIndex);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleFavoriteToggle = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(!isFavorite);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicleName,
        text: `Check out this vehicle: ${vehicleName}`,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or error occurred
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && currentIndex < images.length - 1) {
      // Swipe left - go to next
      goToSlide(currentIndex + 1);
    } else if (distance < -minSwipeDistance && currentIndex > 0) {
      // Swipe right - go to previous
      goToSlide(currentIndex - 1);
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Auto-scroll to current index on mount
  useEffect(() => {
    if (scrollContainerRef.current && images.length > 0) {
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(0);
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[346px] bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center relative">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[346px] bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-3xl">
      {/* Image Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory w-full h-full cursor-grab active:cursor-grabbing"
        style={{ 
          scrollbarWidth: "none", 
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="min-w-full h-full relative snap-start flex items-center justify-center flex-shrink-0"
          >
            <div className="relative w-[calc(100%-24px)] h-[218px] mt-[72px]">
              <Image
                src={image || "/bike.png"}
                alt={`${vehicleName} - Image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 430px) 364px, 364px"
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Back Button - Top Left */}
      <button
        onClick={handleBack}
        className="absolute left-4 top-4 w-9 h-9 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Share and Favorite Buttons - Top Right */}
      <div className="absolute right-4 top-4 flex items-center gap-2 z-10">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-9 h-9 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className={`w-9 h-9 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            isFavorite ? "bg-red-50 border-red-200" : ""
          }`}
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-700 dark:text-gray-300"
            }`}
          />
        </button>
      </div>

      {/* Dot Indicators - Bottom Center */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-gray-900 dark:bg-gray-100"
                  : "bg-gray-400 dark:bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

