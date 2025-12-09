"use client";

import Image from "next/image";
import {
    Home,
    Heart,
    History,
    User,
    SlidersHorizontal,
    Calendar,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "./(components)/navbar";
import { useState, useEffect, useCallback, Suspense } from "react";
import ComingSoonDrawer from "./(components)/drawer";
import { useSearchParams, useRouter } from "next/navigation";
import PickupSelector from "@/app/components/landing/pickup";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

interface Vehicle {
  _id: string;
  store: string;
  name: string;
  brand: string;
  fuelType: "petrol" | "electric" | "diesel";
  pricePerHour: number;
  licensePlate: string;
  image: string[];
  availability: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface VehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
  metadata: {
    pagination: Pagination;
  };
  error?: Array<{ message?: string; path?: string[] }>;
}

function HomePageContentInner() {
    const [open, setOpen] = useState(false);
    const handleClose = (status: boolean) => {
        setOpen(status);
    };

    const router = useRouter();
    const searchParams = useSearchParams();

    // State from URL params
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [latitude, setLatitude] = useState<string>("");
    const [longitude, setLongitude] = useState<string>("");
    const [radiusKm, setRadiusKm] = useState<string>("50");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const limit = 10;

    // Filter state (for editing)
    const [pickupDate, setPickupDate] = useState<Date | null>(null);
    const [pickupTime, setPickupTime] = useState<string | null>(null);
    const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
    const [dropoffTime, setDropoffTime] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Data state
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Initialize from URL params
    useEffect(() => {
        const startTimeParam = searchParams.get("startTime");
        const endTimeParam = searchParams.get("endTime");
        const latParam = searchParams.get("latitude");
        const lngParam = searchParams.get("longitude");
        const radiusParam = searchParams.get("radiusKm");
        const pageParam = searchParams.get("page");

        if (startTimeParam && endTimeParam && latParam && lngParam) {
            setStartTime(startTimeParam);
            setEndTime(endTimeParam);
            setLatitude(latParam);
            setLongitude(lngParam);
            setRadiusKm(radiusParam || "50");
            setCurrentPage(parseInt(pageParam || "1"));

            // Parse dates for filter display
            const start = new Date(startTimeParam);
            const end = new Date(endTimeParam);
            setPickupDate(start);
            setDropoffDate(end);
            setPickupTime(format(start, "HH:mm"));
            setDropoffTime(format(end, "HH:mm"));
        } else {
            setError("Missing required parameters. Please start from the landing page.");
            setLoading(false);
        }
    }, [searchParams]);

    // Fetch vehicles using axios with proper error handling
    const fetchVehicles = useCallback(async () => {
        if (!startTime || !endTime || !latitude || !longitude) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const params = {
                startTime,
                endTime,
                latitude,
                longitude,
                radiusKm,
                page: currentPage.toString(),
                limit: limit.toString(),
            };

            const response = await axiosInstance.get<VehicleResponse>('/api/v1/available-vehicles', {
                params,
            });

            const data = response.data;

            // Check if response indicates success
            if (!data.success) {
                // Handle validation errors
                if (data.error && Array.isArray(data.error)) {
                    const errorMessages = data.error.map((err) => err.message || err.path?.join('.')).join(', ');
                    setError(`Validation error: ${errorMessages}`);
                } else {
                    setError(data.message || "Failed to fetch vehicles. Please try again.");
                }
                setVehicles([]);
                setPagination(null);
                setLoading(false);
                return;
            }

            // Handle empty data
            if (!data.data || !Array.isArray(data.data)) {
                setVehicles([]);
                setPagination(null);
                setError("No vehicles data received from server.");
                setLoading(false);
                return;
            }

            setVehicles(data.data);
            setPagination(data.metadata?.pagination || null);
            setError(""); // Clear any previous errors
        } catch (err) {
            // Handle axios errors
            const axiosError = err as AxiosError<{
                message?: string;
                error?: Array<{ message?: string; path?: string[] }>;
            }>;

            let errorMessage = "An error occurred while fetching vehicles. Please try again.";

            if (axiosError.response) {
                // Server responded with error status
                const status = axiosError.response.status;
                const errorData = axiosError.response.data;

                if (errorData?.error && Array.isArray(errorData.error)) {
                    // Validation errors
                    const errorMessages = errorData.error
                        .map((err) => err.message || err.path?.join('.'))
                        .join(', ');
                    errorMessage = `Validation error: ${errorMessages}`;
                } else if (errorData?.message) {
                    // Server error message
                    errorMessage = errorData.message;
                } else if (status === 503) {
                    // Service unavailable (e.g., database connection issue)
                    errorMessage = "Service temporarily unavailable. Please try again later.";
                } else if (status >= 500) {
                    // Server errors
                    errorMessage = `Server error (${status}). Please try again later.`;
                } else if (status === 404) {
                    errorMessage = "API endpoint not found.";
                } else if (status === 400) {
                    errorMessage = "Invalid request parameters.";
                }
            } else if (axiosError.request) {
                // Request was made but no response received
                errorMessage = "Network error. Please check your connection and try again.";
            } else if (axiosError.message) {
                // Error setting up the request
                errorMessage = axiosError.message;
            }

            setError(errorMessage);
            console.error("Axios error:", axiosError);
            setVehicles([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [startTime, endTime, latitude, longitude, radiusKm, currentPage]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const updateFilters = () => {
        if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime) {
            return;
        }

        const pickupDateTime = new Date(pickupDate);
        const [pickupHour, pickupMinute] = pickupTime.split(":").map(Number);
        pickupDateTime.setHours(pickupHour, pickupMinute, 0, 0);

        const dropoffDateTime = new Date(dropoffDate);
        const [dropoffHour, dropoffMinute] = dropoffTime.split(":").map(Number);
        dropoffDateTime.setHours(dropoffHour, dropoffMinute, 0, 0);

        if (dropoffDateTime <= pickupDateTime) {
            setError("Drop-off time must be later than pickup time");
            return;
        }

        // Update state directly - this will trigger fetchVehicles automatically
        setStartTime(pickupDateTime.toISOString());
        setEndTime(dropoffDateTime.toISOString());
        setCurrentPage(1); // Reset to first page when filters change

        // Update URL for bookmarking/sharing (without triggering navigation)
        const params = new URLSearchParams({
            startTime: pickupDateTime.toISOString(),
            endTime: dropoffDateTime.toISOString(),
            latitude,
            longitude,
            radiusKm,
            page: "1",
            limit: limit.toString(),
        });
        window.history.replaceState({}, '', `/api?${params.toString()}`);
        
        setShowFilters(false);
    };

    const updateLocation = async () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toString();
                const lng = position.coords.longitude.toString();
                
                // Update state directly - this will trigger fetchVehicles automatically
                setLatitude(lat);
                setLongitude(lng);
                setCurrentPage(1); // Reset to first page when location changes

                // Update URL for bookmarking/sharing (without triggering navigation)
                const params = new URLSearchParams({
                    startTime,
                    endTime,
                    latitude: lat,
                    longitude: lng,
                    radiusKm,
                    page: "1",
                    limit: limit.toString(),
                });
                window.history.replaceState({}, '', `/home?${params.toString()}`);
            },
            (error) => {
                setError("Unable to get your location");
            }
        );
    };

    const changePage = (newPage: number) => {
        // Update state directly - this will trigger fetchVehicles automatically
        setCurrentPage(newPage);

        // Update URL for bookmarking/sharing (without triggering navigation)
        const params = new URLSearchParams({
            startTime,
            endTime,
            latitude,
            longitude,
            radiusKm,
            page: newPage.toString(),
            limit: limit.toString(),
        });
        window.history.replaceState({}, '', `/home?${params.toString()}`);
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return format(date, "MMM dd, yyyy 'at' HH:mm");
    };

    const handleVehicleClick = (vehicleId: string) => {
        // Build query params with current search filters
        const params = new URLSearchParams();
        
        if (startTime) {
            params.set("pickupDate", startTime);
            // Extract time from startTime if available
            try {
                const pickupDateObj = new Date(startTime);
                params.set("pickupTime", format(pickupDateObj, "hh:mm a"));
            } catch (e) {
                // Fallback if date parsing fails
                params.set("pickupTime", "10:00 AM");
            }
        }
        
        if (endTime) {
            params.set("dropDate", endTime);
            // Extract time from endTime if available
            try {
                const dropDateObj = new Date(endTime);
                params.set("dropTime", format(dropDateObj, "hh:mm a"));
            } catch (e) {
                // Fallback if date parsing fails
                params.set("dropTime", "10:00 AM");
            }
        }
        
        if (latitude && longitude) {
            params.set("pickupLocation", `${latitude}, ${longitude}`);
            params.set("dropLocation", `${latitude}, ${longitude}`);
        }

        // Navigate to vehicle detail page
        const queryString = params.toString();
        router.push(`/vehicle/${vehicleId}${queryString ? `?${queryString}` : ""}`);
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#0B0A1B] text-black dark:text-white pb-24">

            {/* Top Banner */}
            <div className="w-full rounded-b-3xl p-6 pt-10 relative overflow-hidden">
                {/* Light Mode Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden rounded-b-3xl"
                    style={{ backgroundImage: 'url(/lightBanner.png)' }}
                />
                
                {/* Dark Mode Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block rounded-b-3xl"
                    style={{ backgroundImage: 'url(/darkBanner.png)' }}
                />
                
                {/* Content Overlay */}
                {/* <div className="relative z-10">
                    <h1 className="text-3xl font-semibold">Available Vehicles</h1>
                    <p className="text-gray-800 dark:text-white text-sm mt-1">Find your best ride here</p>
                </div> */}

                {/* Horizontal Search Row - Separate Containers */}
                <div className="flex items-center gap-3 mt-22 relative z-10">
                    {/* Location and Date/Time Container */}
                    <div className="flex-1 flex items-center gap-0 bg-white rounded-full shadow-md overflow-hidden">
                        {/* Location Picker */}
                        <button
                            onClick={updateLocation}
                            className="flex-1 py-3 px-4 flex items-center gap-2 border-r border-gray-200 min-w-0"
                        >
                            <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 text-sm font-medium truncate">
                                {latitude && longitude ? `${parseFloat(latitude).toFixed(2)}, ${parseFloat(longitude).toFixed(2)}` : "Location"}
                            </span>
                        </button>

                        {/* Date/Time Picker */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex-1 py-3 px-4 flex items-center gap-2 min-w-0"
                        >
                            <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 text-sm font-medium truncate">
                                {startTime ? format(new Date(startTime), "MMM dd, HH:mm") : "Pickup date"}
                            </span>
                        </button>
                    </div>

                    {/* Filter Button - Separate Circle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0"
                    >
                        <SlidersHorizontal className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Filter Drawer */}
            {/**
             * @salman
             * convert to shadcn modal
             */}
            {/* Filter Drawer - Using Shadcn Drawer */}
<Drawer open={showFilters} onOpenChange={setShowFilters}>
    <DrawerContent className="max-w-[430px] mx-auto bg-white dark:bg-[#191B27] rounded-t-3xl p-0">
        <div className="w-full p-6 max-h-[80vh] overflow-y-auto">
            <DrawerHeader className="p-0 mb-4">
                <DrawerTitle className="text-xl font-semibold">Update Filters</DrawerTitle>
            </DrawerHeader>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-light mb-2">Pickup Date & Time</h4>
                    <PickupSelector
                        pickup={true}
                        date={pickupDate}
                        time={pickupTime}
                        onDateChange={setPickupDate}
                        onTimeChange={setPickupTime}
                    />
                </div>

                <div>
                    <h4 className="font-light mb-2">Dropoff Date & Time</h4>
                    <PickupSelector
                        pickup={false}
                        date={dropoffDate}
                        time={dropoffTime}
                        onDateChange={setDropoffDate}
                        onTimeChange={setDropoffTime}
                    />
                </div>

                <Button
                    onClick={updateFilters}
                    className="w-full h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] text-black font-semibold text-lg"
                >
                    Apply Filters
                </Button>
            </div>
        </div>
    </DrawerContent>
</Drawer>

            {/* Vehicles Section */}
            <div className="px-4 mt-5">
                <h2 className="text-lg font-semibold">Available vehicles</h2>

                {/* Skeleton Loading State */}
                {loading && (
                    <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        {[...Array(4)].map((_, index) => (
                            <Card
                                key={`skeleton-${index}`}
                                className="rounded-xl border shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-full flex flex-col"
                            >
                                <CardContent className="flex flex-col gap-3 p-3 h-full">
                                    {/* Image Skeleton */}
                                    <div className="w-full aspect-[16/10] bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />

                                    {/* Content Skeleton */}
                                    <div className="flex-1 flex flex-col space-y-2">
                                        {/* Title Skeleton */}
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 skeleton" />
                                        
                                        {/* Price Skeleton */}
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 skeleton" />
                                        
                                        {/* Badge and License Plate Skeleton */}
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

                {/* Error State */}
                {error && !loading && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && vehicles.length === 0 && (
                    <div className="mt-8 text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                <MapPin className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No vehicles found
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                                No vehicles are available for the selected dates and location.
                            </p>
                            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <p>Try:</p>
                                <ul className="list-disc list-inside space-y-1 text-left">
                                    <li>Adjusting your pickup or dropoff dates</li>
                                    <li>Updating your location</li>
                                    <li>Increasing the search radius</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vehicle Cards */}
                {!loading && !error && vehicles.length > 0 && (
                    <>
                        <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            {vehicles.map((vehicle, index) => (
                                <Card
                                    key={vehicle._id}
                                    onClick={() => handleVehicleClick(vehicle._id)}
                                    className={`rounded-xl border shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow h-full flex flex-col cursor-pointer ${
                                        index === 0 ? "border-2" : ""
                                    }`}
                                >
                                    <CardContent className="flex flex-col gap-3 p-3 h-full">
                                        <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <Image
                                                src={vehicle.image && vehicle.image.length > 0 ? vehicle.image[0] : "/bike.png"}
                                                alt={vehicle.name}
                                                fill
                                                className="object-cover"
                                                sizes="50vw"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <h3 className="font-semibold leading-tight text-sm">
                                                {vehicle.brand} {vehicle.name}
                                            </h3>
                                            <p className="text-[#FF6B00] font-semibold mt-1.5 text-base">
                                                ₹ {vehicle.pricePerHour}/hour
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <Badge variant="outline" className="text-xs">
                                                    {vehicle.fuelType}
                                                </Badge>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {vehicle.licensePlate}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-6 mb-4">
                                <Button
                                    onClick={() => changePage(currentPage - 1)}
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
                                    onClick={() => changePage(currentPage + 1)}
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
            
            {/* Bottom Banner Section */}
            {/* <div className="w-full mt-8 mb-6 px-4">
                <div className="relative w-full aspect-[16/5] rounded-2xl overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden rounded-2xl"
                        style={{ backgroundImage: 'url(/lightBanner.png)' }}
                    />
                    
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block rounded-2xl"
                        style={{ backgroundImage: 'url(/darkBanner.png)' }}
                    />
                </div>
            </div> */}
            
            <ComingSoonDrawer open={open} setOpen={handleClose}/>
            {/* Bottom Navigation */}
            <Navbar />
        </div>
    );
}


/**
 * @salman
 * remove this suspense wrapper later
 * @returns 
 */
export default function HomePageContent() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full bg-white dark:bg-[#0B0A1B] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#F4AA05]" />
            </div>
        }>
            <HomePageContentInner />
        </Suspense>
    );
}