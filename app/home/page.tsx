"use client";

import Image from "next/image";
import {
    SlidersHorizontal,
    Calendar,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "./(components)/navbar";
import Topbar from "./(components)/topbar";
import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import ComingSoonDrawer from "./(components)/drawer";
import { useSearchParams, useRouter } from "next/navigation";
import PickupSelector from "@/app/components/landing/pickup";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { Pagination, VehicleResponse } from "../api/v1/available-vehicles/route";
import { IVehicle } from "@/core/interface/model/IVehicle.model";
import { IStore } from "@/core/interface/model/IStore.model";
import { StoreSelector } from "@/components/StoreSelector";
import FilterSidebar from "./(components)/FilterSidebar";
import DesktopFilterBar from "./(components)/DesktopFilterBar";

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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const limit = 10;

    // Store state
    const [allStores, setAllStores] = useState<IStore[]>([]);
    const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
    const [storesLoading, setStoresLoading] = useState<boolean>(true);

    // Filter state (for editing)
    const [pickupDate, setPickupDate] = useState<Date | null>(null);
    const [pickupTime, setPickupTime] = useState<string | null>(null);
    const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
    const [dropoffTime, setDropoffTime] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Screen size detection for responsive modal/drawer
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Check on mount
        checkMobile();

        // Add listener for resize
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Filter state for sidebar
    const [sortBy, setSortBy] = useState<string>("popular");
    const [priceRange, setPriceRange] = useState<[number, number]>([250, 1800]);
    const [bikeTypes, setBikeTypes] = useState<string[]>([]);
    const [fuelType, setFuelType] = useState<string>("Both");
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

    // Data state
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Fetch all stores on mount
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await axiosInstance.get<{ success: boolean; data: IStore[] }>('/api/v1/stores');
                if (response.data.success) {
                    setAllStores(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch stores:", err);
            } finally {
                setStoresLoading(false);
            }
        };
        fetchStores();
    }, []);

    // Initialize from URL params and find nearest store
    useEffect(() => {
        const startTimeParam = searchParams.get("startTime");
        const endTimeParam = searchParams.get("endTime");
        const storeIdParam = searchParams.get("storeId");
        const pageParam = searchParams.get("page");

        if (startTimeParam && endTimeParam) {
            setStartTime(startTimeParam);
            setEndTime(endTimeParam);
            setCurrentPage(parseInt(pageParam || "1"));

            // Parse dates for filter display
            const start = new Date(startTimeParam);
            const end = new Date(endTimeParam);
            setPickupDate(start);
            setDropoffDate(end);
            setPickupTime(format(start, "HH:mm"));
            setDropoffTime(format(end, "HH:mm"));

            // If storeId is in URL, find and set that store
            if (storeIdParam && allStores.length > 0) {
                const store = allStores.find(s => s._id.toString() === storeIdParam);
                if (store) {
                    setSelectedStore(store);
                }
            } else if (!selectedStore && allStores.length > 0 && !storesLoading) {
                // Auto-select nearest store based on user location, or fallback to first store
                findNearestStore();
            }
        } else {
            setError("Missing required parameters. Please start from the landing page.");
            setLoading(false);
        }
    }, [searchParams, allStores, storesLoading]);

    // Find nearest store based on user's geolocation
    const findNearestStore = async () => {
        if (!navigator.geolocation) {
            // Fallback to first store if geolocation not available
            if (allStores.length > 0) {
                setSelectedStore(allStores[0]);
            }
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await axiosInstance.get<{ success: boolean; data: IStore }>(
                        `/api/v1/stores?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
                    );
                    if (response.data.success && response.data.data) {
                        setSelectedStore(response.data.data);
                    } else if (allStores.length > 0) {
                        setSelectedStore(allStores[0]);
                    }
                } catch (err) {
                    console.error("Failed to find nearest store:", err);
                    // Fallback to first store
                    if (allStores.length > 0) {
                        setSelectedStore(allStores[0]);
                    }
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                // Fallback to first store
                if (allStores.length > 0) {
                    setSelectedStore(allStores[0]);
                }
            }
        );
    };

    // Fetch vehicles using axios with proper error handling
    const fetchVehicles = useCallback(async () => {
        if (!startTime || !endTime || !selectedStore) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const params = {
                startTime,
                endTime,
                storeId: selectedStore._id.toString(),
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
    }, [startTime, endTime, selectedStore, currentPage]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Compute available brands from vehicles
    const availableBrands = useMemo(() => {
        const brands = new Set(vehicles.map(v => v.brand));
        return Array.from(brands).sort();
    }, [vehicles]);

    // Compute min/max prices from vehicles
    const { minPrice, maxPrice } = useMemo(() => {
        if (vehicles.length === 0) return { minPrice: 250, maxPrice: 1800 };
        const prices = vehicles.map(v => v.pricePerDay);
        return {
            minPrice: Math.floor(Math.min(...prices) / 50) * 50,
            maxPrice: Math.ceil(Math.max(...prices) / 50) * 50,
        };
    }, [vehicles]);

    // Filter and sort vehicles based on filter state
    const filteredVehicles = useMemo(() => {
        let filtered = [...vehicles];

        // Filter by price range
        filtered = filtered.filter(v =>
            v.pricePerDay >= priceRange[0] && v.pricePerDay <= priceRange[1]
        );

        // Filter by bike type
        if (bikeTypes.length > 0) {
            filtered = filtered.filter(v =>
                bikeTypes.some(type => v.name.toLowerCase().includes(type.toLowerCase()))
            );
        }

        // Filter by fuel type
        if (fuelType !== "Both") {
            filtered = filtered.filter(v =>
                v.fuelType.toLowerCase() === fuelType.toLowerCase()
            );
        }

        // Filter by brand
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(v => selectedBrands.includes(v.brand));
        }

        // Sort vehicles
        switch (sortBy) {
            case "priceLowHigh":
                filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
                break;
            case "priceHighLow":
                filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
                break;
            case "rating":
                // Placeholder for rating sort - would need rating field in vehicle model
                break;
            case "popular":
            default:
                // Keep default order
                break;
        }

        return filtered;
    }, [vehicles, priceRange, bikeTypes, fuelType, selectedBrands, sortBy]);

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
        if (selectedStore) {
            const params = new URLSearchParams({
                startTime: pickupDateTime.toISOString(),
                endTime: dropoffDateTime.toISOString(),
                storeId: selectedStore._id.toString(),
                page: "1",
                limit: limit.toString(),
            });
            window.history.replaceState({}, '', `/home?${params.toString()}`);
        }

        setShowFilters(false);
    };

    const handleStoreSelect = (store: IStore) => {
        setSelectedStore(store);
        setCurrentPage(1); // Reset to first page when store changes

        // Update URL for bookmarking/sharing
        const params = new URLSearchParams({
            startTime,
            endTime,
            storeId: store._id.toString(),
            page: "1",
            limit: limit.toString(),
        });
        window.history.replaceState({}, '', `/home?${params.toString()}`);
    };

    const changePage = (newPage: number) => {
        // Update state directly - this will trigger fetchVehicles automatically
        setCurrentPage(newPage);

        // Update URL for bookmarking/sharing (without triggering navigation)
        if (selectedStore) {
            const params = new URLSearchParams({
                startTime,
                endTime,
                storeId: selectedStore._id.toString(),
                page: newPage.toString(),
                limit: limit.toString(),
            });
            window.history.replaceState({}, '', `/home?${params.toString()}`);
        }
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
            } catch {
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
            } catch {
                // Fallback if date parsing fails
                params.set("dropTime", "10:00 AM");
            }
        }

        if (selectedStore) {
            params.set("pickupLocation", `${selectedStore.address}, ${selectedStore.district}`);
            params.set("dropLocation", `${selectedStore.address}, ${selectedStore.district}`);
        }

        // Navigate to vehicle detail page
        const queryString = params.toString();
        router.push(`/vehicle/${vehicleId}${queryString ? `?${queryString}` : ""}`);
    };

    return (
        <>
            {/* Top Navigation - Desktop Only */}
            <Topbar />

            <div className="min-h-screen w-full bg-white dark:bg-[#0B0A1B] text-black dark:text-white pb-24 md:pb-0 md:pt-20">
                {/* Desktop Layout with Sidebar */}
                <div className="hidden md:flex h-screen pt-4">
                    {/* Left Sidebar - Filters */}
                    <div className="w-64 flex-shrink-0 h-full overflow-hidden">
                        <FilterSidebar
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            priceRange={priceRange}
                            onPriceRangeChange={setPriceRange}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            bikeTypes={bikeTypes}
                            onBikeTypesChange={setBikeTypes}
                            fuelType={fuelType}
                            onFuelTypeChange={setFuelType}
                            selectedBrands={selectedBrands}
                            onBrandsChange={setSelectedBrands}
                            availableBrands={availableBrands}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto px-6">
                        {/* Desktop Filter Bar */}
                        <DesktopFilterBar
                            allStores={allStores}
                            selectedStore={selectedStore}
                            onStoreSelect={handleStoreSelect}
                            storesLoading={storesLoading}
                            startTime={startTime}
                            endTime={endTime}
                            onFilterClick={() => setShowFilters(true)}
                        />

                        {/* Vehicle Grid */}
                        <VehicleGrid
                            loading={loading}
                            error={error}
                            vehicles={filteredVehicles}
                            pagination={pagination}
                            currentPage={currentPage}
                            onPageChange={changePage}
                            onVehicleClick={handleVehicleClick}
                        />
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                    {/* Top Banner */}
                    <div className="w-full rounded-b-3xl relative overflow-hidden h-40">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden rounded-b-3xl"
                            style={{ backgroundImage: 'url(/lightNav.jpg)' }}
                        />
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block rounded-b-3xl"
                            style={{ backgroundImage: 'url(/darkNav.jpg)' }}
                        />
                        {/* Logo in top-left corner */}
                        <div className="absolute top-4 left-4 z-10">
                            <Image
                                src="/logo.png"
                                alt="TooBikes Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Search Row */}
                    <div className="px-6 -mt-7 relative z-20 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 flex items-center gap-0 bg-white rounded-full shadow-md overflow-hidden">
                                <div className="flex-1 border-r border-gray-200">
                                    <StoreSelector
                                        stores={allStores}
                                        selectedStore={selectedStore}
                                        onStoreSelect={handleStoreSelect}
                                        loading={storesLoading}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex-1 py-3 px-4 flex items-center gap-2 min-w-0"
                                >
                                    <Calendar size={18} className="text-gray-400 shrink-0" />
                                    <span className="text-gray-700 text-sm font-medium truncate">
                                        {startTime ? format(new Date(startTime), "MMM dd, HH:mm") : "Pickup date"}
                                    </span>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center shrink-0"
                            >
                                <SlidersHorizontal className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>
                    </div>

                    {/* Vehicle Grid */}
                    <div className="px-4 mt-5">
                        <VehicleGrid
                            loading={loading}
                            error={error}
                            vehicles={filteredVehicles}
                            pagination={pagination}
                            currentPage={currentPage}
                            onPageChange={changePage}
                            onVehicleClick={handleVehicleClick}
                        />
                    </div>
                </div>

                {/* Filter Modal - Responsive */}
                {isMobile ? (
                    // Mobile: Bottom Drawer
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
                                        disabled={!pickupDate || !pickupTime || !dropoffDate || !dropoffTime}
                                        className="w-full h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] text-black font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                ) : (
                    // Desktop: Centered Dialog
                    <Dialog open={showFilters} onOpenChange={setShowFilters}>
                        <DialogContent className="max-w-md bg-white dark:bg-[#191B27]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">Update Filters</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
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
                                    disabled={!pickupDate || !pickupTime || !dropoffDate || !dropoffTime}
                                    className="w-full h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] text-black font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                <ComingSoonDrawer open={open} setOpen={handleClose} />
                <Navbar />
            </div>
        </>
    );
}

// Vehicle Grid Component
interface VehicleGridProps {
    loading: boolean;
    error: string;
    vehicles: IVehicle[];
    pagination: Pagination | null;
    currentPage: number;
    onPageChange: (page: number) => void;
    onVehicleClick: (vehicleId: string) => void;
}

function VehicleGrid({ loading, error, vehicles, pagination, currentPage, onPageChange, onVehicleClick }: VehicleGridProps) {
    return (
        <>
            <h2 className="text-lg font-semibold mb-4">Available vehicles</h2>

            {/* Skeleton Loading State */}
            {loading && (
                <div className="grid gap-3 mt-4 md:grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                    {[...Array(6)].map((_, index) => (
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
                            No vehicles are available for the selected filters.
                        </p>
                    </div>
                </div>
            )}

            {/* Vehicle Cards */}
            {!loading && !error && vehicles.length > 0 && (
                <>
                    <div className="grid gap-3 mt-4 grid-cols-2 md:grid-cols-4">
                        {vehicles.map((vehicle) => (
                            <Card
                                key={vehicle._id.toString()}
                                onClick={() => onVehicleClick(vehicle._id.toString())}
                                className="group relative rounded-xl border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200 h-full flex flex-col cursor-pointer overflow-hidden"
                            >
                                <CardContent className="flex flex-col p-0 h-full">
                                    <div className="relative w-full aspect-16/10 overflow-hidden bg-white dark:bg-gray-900">
                                        <Image
                                            src={vehicle.image && vehicle.image.length > 0 ? vehicle.image[0] : "/bike.png"}
                                            alt={vehicle.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                        />
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
                                                    ₹{vehicle.pricePerDay}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">/day</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-auto">
                                            <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                                {vehicle.fuelType}
                                            </div>
                                            <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                                                {vehicle.licensePlate}
                                            </div>
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
                                onClick={() => onPageChange(currentPage - 1)}
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
                                onClick={() => onPageChange(currentPage + 1)}
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
        </>
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