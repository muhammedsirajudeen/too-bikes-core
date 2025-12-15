"use client";

import { Calendar, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import { IStore } from "@/core/interface/model/IStore.model";
import { StoreSelector } from "@/components/StoreSelector";

interface DesktopFilterBarProps {
    allStores: IStore[];
    selectedStore: IStore | null;
    onStoreSelect: (store: IStore) => void;
    storesLoading: boolean;
    startTime: string;
    endTime: string;
    onFilterClick: () => void;
}

export default function DesktopFilterBar({
    allStores,
    selectedStore,
    onStoreSelect,
    storesLoading,
    startTime,
    endTime,
    onFilterClick,
}: DesktopFilterBarProps) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-full shadow-lg px-6 py-4 flex items-center gap-6">
                {/* Location */}
                <div className="flex-1 flex flex-col gap-1 border-r border-gray-200 dark:border-gray-700 pr-6">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Location
                    </label>
                    <StoreSelector
                        stores={allStores}
                        selectedStore={selectedStore}
                        onStoreSelect={onStoreSelect}
                        loading={storesLoading}
                    />
                </div>

                {/* Pickup */}
                <button
                    onClick={onFilterClick}
                    className="flex-1 flex flex-col gap-1 border-r border-gray-200 dark:border-gray-700 pr-6 text-left"
                >
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Pickup
                    </label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {startTime ? format(new Date(startTime), "MMM dd, hh:mm a") : "Select date & time"}
                    </div>
                </button>

                {/* Drop */}
                <button
                    onClick={onFilterClick}
                    className="flex-1 flex flex-col gap-1 pr-6 text-left"
                >
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Drop
                    </label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {endTime ? format(new Date(endTime), "MMM dd, hh:mm a") : "Select date & time"}
                    </div>
                </button>

                {/* Search Button */}
                <button
                    onClick={onFilterClick}
                    className="w-12 h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] flex items-center justify-center flex-shrink-0 transition-colors"
                >
                    <Search className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
    );
}
