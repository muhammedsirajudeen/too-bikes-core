"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleImageSliderProps {
  images: string[];
  vehicleName: string;
}

export default function VehicleImageSlider({
  images,
  vehicleName,
}: VehicleImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const nextSlide = () => {
    const next = (currentIndex + 1) % images.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    goToSlide(prev);
  };

  // Auto-scroll to current index on mount
  useEffect(() => {
    if (scrollContainerRef.current && images.length > 0) {
      setCurrentIndex(0);
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[280px] bg-gray-200 dark:bg-gray-800 rounded-3xl flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Image Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory w-full h-[280px] rounded-3xl"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="min-w-full h-full relative snap-start"
          >
            <Image
              src={image || "/bike.png"}
              alt={`${vehicleName} - Image ${index + 1}`}
              fill
              className="object-cover rounded-3xl"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            onClick={prevSlide}
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={nextSlide}
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-[#F4AA05]"
                  : "w-2 bg-gray-300 dark:bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

