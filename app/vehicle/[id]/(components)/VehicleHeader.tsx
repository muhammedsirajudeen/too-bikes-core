"use client";

import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface VehicleHeaderProps {
  onBack?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}

export default function VehicleHeader({
  onBack,
  isFavorite: initialFavorite = false,
  onFavoriteToggle,
}: VehicleHeaderProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleFavoriteToggle = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    if (onFavoriteToggle) {
      onFavoriteToggle(newFavoriteState);
    }
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-3">
      <Button
        onClick={handleBack}
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:bg-white dark:hover:bg-gray-800"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleFavoriteToggle}
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full backdrop-blur-sm shadow-md transition-colors ${
            isFavorite
              ? "bg-red-500/90 text-white hover:bg-red-600/90"
              : "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
          />
        </Button>
      </div>
    </div>
  );
}


