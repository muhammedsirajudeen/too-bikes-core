"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface FilterSidebarProps {
    // Sort options
    sortBy: string;
    onSortChange: (value: string) => void;

    // Price range
    priceRange: [number, number];
    onPriceRangeChange: (value: [number, number]) => void;
    minPrice: number;
    maxPrice: number;

    // Bike type
    bikeTypes: string[];
    onBikeTypesChange: (types: string[]) => void;

    // Fuel type
    fuelType: string;
    onFuelTypeChange: (type: string) => void;

    // Brands
    selectedBrands: string[];
    onBrandsChange: (brands: string[]) => void;
    availableBrands: string[];
}

export default function FilterSidebar({
    sortBy,
    onSortChange,
    priceRange,
    onPriceRangeChange,
    minPrice,
    maxPrice,
    bikeTypes,
    onBikeTypesChange,
    fuelType,
    onFuelTypeChange,
    selectedBrands,
    onBrandsChange,
    availableBrands,
}: FilterSidebarProps) {
    const [showAllBrands, setShowAllBrands] = useState(false);

    const sortOptions = [
        { value: "popular", label: "Popular" },
        { value: "rating", label: "Rating" },
        { value: "priceLowHigh", label: "Price Low → High" },
        { value: "priceHighLow", label: "Price High → Low" },
    ];

    const bikeTypeOptions = [
        { value: "Scooter", label: "Scooter" },
        { value: "Sport", label: "Sport" },
        { value: "Cruiser", label: "Cruiser" },
    ];

    const fuelTypeOptions = [
        { value: "Both", label: "Both" },
        { value: "Electric", label: "Electric" },
        { value: "Petrol", label: "Petrol" },
    ];

    const displayedBrands = showAllBrands ? availableBrands : availableBrands.slice(0, 5);

    const handleBikeTypeToggle = (type: string) => {
        if (bikeTypes.includes(type)) {
            onBikeTypesChange(bikeTypes.filter((t) => t !== type));
        } else {
            onBikeTypesChange([...bikeTypes, type]);
        }
    };

    const handleBrandToggle = (brand: string) => {
        if (brand === "All") {
            onBrandsChange([]);
        } else if (selectedBrands.includes(brand)) {
            onBrandsChange(selectedBrands.filter((b) => b !== brand));
        } else {
            onBrandsChange([...selectedBrands, brand]);
        }
    };

    return (
        <div className="w-full h-full p-6 overflow-y-auto bg-white dark:bg-[#101828]">
            {/* Filters Header */}
            <div className="flex items-center gap-2 mb-6">
                <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
            </div>

            {/* Sort By */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Sort By</h4>
                <div className="space-y-2">
                    {sortOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="sort"
                                value={option.value}
                                checked={sortBy === option.value}
                                onChange={(e) => onSortChange(e.target.value)}
                                className="w-4 h-4 text-[#FF6B00] focus:ring-[#FF6B00]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Price Range</h4>
                <div className="px-2">
                    <Slider
                        value={priceRange}
                        onValueChange={(value: number[]) => onPriceRangeChange(value as [number, number])}
                        min={minPrice}
                        max={maxPrice}
                        step={50}
                        className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                    </div>
                </div>
            </div>

            {/* Bike Type */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Bike Type</h4>
                <div className="space-y-2">
                    {bikeTypeOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={bikeTypes.includes(option.value)}
                                onChange={() => handleBikeTypeToggle(option.value)}
                                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Fuel Type */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Fuel Type</h4>
                <div className="space-y-2">
                    {fuelTypeOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="fuel"
                                value={option.value}
                                checked={fuelType === option.value}
                                onChange={(e) => onFuelTypeChange(e.target.value)}
                                className="w-4 h-4 text-[#FF6B00] focus:ring-[#FF6B00]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brand */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Brand</h4>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedBrands.length === 0}
                            onChange={() => handleBrandToggle("All")}
                            className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">All</span>
                    </label>
                    {displayedBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => handleBrandToggle(brand)}
                                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{brand}</span>
                        </label>
                    ))}
                    {availableBrands.length > 5 && (
                        <button
                            onClick={() => setShowAllBrands(!showAllBrands)}
                            className="text-sm text-[#FF6B00] hover:text-[#FF8533] font-medium"
                        >
                            {showAllBrands ? "Show less" : `+${availableBrands.length - 5} brands`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
