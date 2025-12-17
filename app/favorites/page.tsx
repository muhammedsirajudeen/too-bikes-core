"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Heart, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import Navbar from "@/app/home/(components)/navbar";
import { removeFromFavorites } from "@/services/client/favorites.service";

// Prevent static generation since this page requires authentication
export const dynamic = 'force-dynamic';


interface Vehicle {
    _id: string;
    name: string;
    brand: string;
    description?: string;
    fuelType: "petrol" | "diesel" | "electric";
    pricePerHour: number;
    pricePerDay?: number;
    licensePlate?: string;
    image?: string[];
    availability: boolean;
}

interface FavoriteItem {
    _id: string;
    userId: string;
    vehicleId: Vehicle;
}

interface PaginationMetadata {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showConfirmSheet, setShowConfirmSheet] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [removing, setRemoving] = useState(false);
    const limit = 10;

    useEffect(() => {
        fetchFavorites(currentPage);
    }, [currentPage]);

    const fetchFavorites = async (page: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get("/api/v1/user/favorites", {
                params: {
                    page,
                    limit
                }
            });

            if (response.data.success) {
                setFavorites(response.data.data.favorites);
                setPagination(response.data.data.pagination);
            } else {
                setError(response.data.message || "Failed to fetch favorites");
            }
        } catch (err) {
            console.error("Error fetching favorites:", err);
            setError("Failed to load favorites. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleClick = (vehicleId: string) => {
        router.push(`/vehicle/${vehicleId}`);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFavoriteClick = (e: React.MouseEvent, vehicle: Vehicle) => {
        e.stopPropagation();
        setSelectedVehicle(vehicle);
        setShowConfirmSheet(true);
    };

    const handleRemoveFavorite = async () => {
        if (!selectedVehicle) return;

        try {
            setRemoving(true);
            await removeFromFavorites(selectedVehicle._id);

            // Remove from local state
            setFavorites(prev => prev.filter(fav => fav.vehicleId._id !== selectedVehicle._id));

            // Close the sheet
            setShowConfirmSheet(false);
            setSelectedVehicle(null);
        } catch (err) {
            console.error("Error removing from favorites:", err);
            setError("Failed to remove from favorites. Please try again.");
        } finally {
            setRemoving(false);
        }
    };

    if (error && !loading && favorites.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0B0A1B] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-lg">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Favorites
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={() => fetchFavorites(currentPage)}
                            className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0A1B] pb-28">
            {/* Header */}
            <div className="pt-12 pb-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Favorites</h1>
                    <p className="text-gray-600 dark:text-gray-400">Your favorite vehicles</p>
                </div>
            </div>

            {/* Favorites Content */}
            <div className="max-w-6xl mx-auto px-4">
                {/* Skeleton Loading State */}
                {loading && (
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                        {[...Array(8)].map((_, index) => (
                            <Card
                                key={`skeleton-${index}`}
                                className="rounded-xl border shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-full flex flex-col"
                            >
                                <CardContent className="flex flex-col gap-3 p-3 h-full">
                                    <div className="w-full aspect-16/10 bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />
                                    <div className="flex-1 flex flex-col space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 skeleton" />
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 skeleton" />
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-12 skeleton" />
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 skeleton" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && favorites.length === 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Favorites Yet
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Start adding vehicles to your favorites to see them here
                            </p>
                            <button
                                onClick={() => router.push("/home")}
                                className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                            >
                                Browse Vehicles
                            </button>
                        </div>
                    </div>
                )}

                {/* Favorites Grid */}
                {!loading && favorites.length > 0 && (
                    <>
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                            {favorites.map((favorite) => {
                                const vehicle = favorite.vehicleId;
                                return (
                                    <Card
                                        key={favorite._id}
                                        onClick={() => handleVehicleClick(vehicle._id)}
                                        className="group relative rounded-xl border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200 h-full flex flex-col cursor-pointer overflow-hidden"
                                    >
                                        <CardContent className="flex flex-col p-0 h-full">
                                            <div className="relative w-full aspect-16/10 overflow-hidden bg-white dark:bg-gray-900">
                                                {vehicle.image && vehicle.image.length > 0 ? (
                                                    <Image
                                                        src={vehicle.image[0]}
                                                        alt={vehicle.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                        <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                                                    </div>
                                                )}

                                                {/* Favorite Icon - Red and filled */}
                                                <button
                                                    onClick={(e) => handleFavoriteClick(e, vehicle)}
                                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                                                >
                                                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                                </button>
                                            </div>
                                            <div className="flex-1 flex flex-col p-3">
                                                <div className="mb-2.5">
                                                    <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                                        {vehicle.brand}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {vehicle.name}
                                                    </p>
                                                </div>
                                                <div className="relative mb-2.5 py-2">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-bold text-[#FF6B00]">
                                                            ₹{vehicle.pricePerDay || vehicle.pricePerHour}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                                            /{vehicle.pricePerDay ? 'day' : 'hr'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-auto">
                                                    <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                                        {vehicle.fuelType}
                                                    </div>
                                                    {vehicle.licensePlate && (
                                                        <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                                                            {vehicle.licensePlate}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-6 mb-4">
                                <Button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.hasPrev}
                                    className="rounded-full"
                                    variant="outline"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <Button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.hasNext}
                                    className="rounded-full"
                                    variant="outline"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Confirmation Bottom Drawer */}
            <Drawer open={showConfirmSheet} onOpenChange={setShowConfirmSheet}>
                <DrawerContent className="max-w-[430px] mx-auto">
                    <DrawerHeader>
                        <DrawerTitle>Remove from Favorites?</DrawerTitle>
                        <DrawerDescription>
                            Are you sure you want to remove <strong>{selectedVehicle?.brand} {selectedVehicle?.name}</strong> from your favorites?
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex gap-3 mt-6 px-4 pb-6">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowConfirmSheet(false)}
                            disabled={removing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-[#FF6B00] hover:bg-[#FF5500] text-white"
                            onClick={handleRemoveFavorite}
                            disabled={removing}
                        >
                            {removing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                "Yes, Remove"
                            )}
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Bottom Navigation */}
            <Suspense fallback={<div className="h-20" />}>
                <Navbar />
            </Suspense>
        </div>
    );
}
