"use client";

import { Fuel, Zap, Droplets } from "lucide-react";

interface VehicleInfoCardProps {
  brand: string;
  model: string;
  price: number;
  pricePerDay?: number;
  freeKilometers?: number;
  fuelType: "petrol" | "diesel" | "electric";
}

export default function VehicleInfoCard({
  brand,
  model,
  price,
  pricePerDay,
  freeKilometers = 480,
  fuelType,
}: VehicleInfoCardProps) {
  const getFuelIcon = () => {
    switch (fuelType) {
      case "electric":
        return <Zap className="h-5 w-5 text-[#F4AA05]" />;
      case "petrol":
        return <Droplets className="h-5 w-5 text-[#F4AA05]" />;
      case "diesel":
        return <Fuel className="h-5 w-5 text-[#F4AA05]" />;
      default:
        return <Fuel className="h-5 w-5 text-[#F4AA05]" />;
    }
  };

  const getFuelLabel = () => {
    switch (fuelType) {
      case "electric":
        return "Electric";
      case "petrol":
        return "Petrol";
      case "diesel":
        return "Diesel";
      default:
        return fuelType;
    }
  };

  return (
    <div className="bg-white dark:bg-[#191B27] rounded-[30px] p-6 shadow-lg mx-4 -mt-4 relative z-10">
      {/* Brand Name */}
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
        {brand}
      </p>

      {/* Model Name */}
      <div className="flex items-start justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1 pr-4">
          {model}
        </h1>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{pricePerDay}/day
          </p>
        </div>
      </div>

      {/* Features Row */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Free Kilometers
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {freeKilometers} km
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {getFuelIcon()}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getFuelLabel()}
          </span>
        </div>
      </div>
    </div>
  );
}


