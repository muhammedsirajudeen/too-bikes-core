"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import PickupSelector from "./pickup";

import { useRouter } from "next/navigation";
import ROUTE_CONSTANTS from "@/constants/routeConstants";
import { IStore } from "@/core/interface/model/IStore.model";


export default function DesktopLandingPage() {
    const { resolvedTheme, setTheme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Pickup state
    const [pickupDate, setPickupDate] = useState<Date | null>(null);
    const [pickupTime, setPickupTime] = useState<string | null>(null);

    // Dropoff state
    const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
    const [dropoffTime, setDropoffTime] = useState<string | null>(null);

    // Validation errors
    const [pickupError, setPickupError] = useState<string>("");
    const [dropoffError, setDropoffError] = useState<string>("");

    // Location state
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isRequestingLocation, setIsRequestingLocation] = useState(false);

    // Store state
    // const [stores, setStores] = useState<IStore[]>([]); // Unused
    const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
    const [storesLoading, setStoresLoading] = useState(true);
    // const [locationError, setLocationError] = useState<string>(""); // Unused

    // Ref for scrolling to button
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
        // Fetch stores on mount
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await fetch('/api/v1/stores');
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                // setStores(data.data);
                // Auto-select first store as default
                setSelectedStore(data.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        } finally {
            setStoresLoading(false);
        }
    };

    if (!mounted) return null;

    const getLocation = async (): Promise<{ lat: number; lng: number } | null> => {
        if (!navigator.geolocation) {
            // setLocationError("Geolocation is not supported by your browser");
            return null;
        }

        setIsRequestingLocation(true);
        // setLocationError("");

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setLocation({ lat, lng });
                    setIsRequestingLocation(false);
                    resolve({ lat, lng });
                },
                () => {
                    setIsRequestingLocation(false);
                    // let errorMsg = "Unable to get your location";
                    /*
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = "Location permission denied. You'll see all available vehicles.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = "Location unavailable. You'll see all available vehicles.";
                            break;
                        case error.TIMEOUT:
                            errorMsg = "Location request timed out. You'll see all available vehicles.";
                            break;
                    }
                    */
                    // setLocationError(errorMsg);
                    resolve(null);
                }
            );
        });
    };

    const validateAndNavigate = async () => {
        // Reset errors
        setPickupError("");
        setDropoffError("");
        // setLocationError("");

        let isValid = true;

        // Validate pickup
        if (!pickupDate || !pickupTime) {
            setPickupError("Please select both pickup date and time");
            isValid = false;
        }

        // Validate dropoff
        if (!dropoffDate || !dropoffTime) {
            setDropoffError("Please select both dropoff date and time");
            isValid = false;
        }

        if (!isValid) return;

        // Create full datetime objects for validation
        const pickupDateTime = new Date(pickupDate!);
        const [pickupHour, pickupMinute] = pickupTime!.split(":").map(Number);
        pickupDateTime.setHours(pickupHour, pickupMinute, 0, 0);

        const dropoffDateTime = new Date(dropoffDate!);
        const [dropoffHour, dropoffMinute] = dropoffTime!.split(":").map(Number);
        dropoffDateTime.setHours(dropoffHour, dropoffMinute, 0, 0);

        const now = new Date();

        // Validate pickup is not in the past
        if (pickupDateTime <= now) {
            setPickupError("Pickup time cannot be in the past");
            isValid = false;
        }

        // Validate dropoff is after pickup
        if (dropoffDateTime <= pickupDateTime) {
            setDropoffError("Drop-off time must be later than pickup time");
            isValid = false;
        }

        if (!isValid) return;

        // Get location (optional)
        let finalLocation = location;
        if (!finalLocation) {
            finalLocation = await getLocation();
        }

        // Build query params
        const params = new URLSearchParams({
            startTime: pickupDateTime.toISOString(),
            endTime: dropoffDateTime.toISOString(),
            page: "1",
            limit: "10"
        });

        // Add storeId (required for home page)
        if (selectedStore) {
            params.append("storeId", selectedStore._id.toString());
        }

        // Add location params only if available
        if (finalLocation) {
            params.append("latitude", finalLocation.lat.toString());
            params.append("longitude", finalLocation.lng.toString());
            params.append("radiusKm", "50"); // Default radius
        }

        // Navigate to vehicle listing page
        router.push(`${ROUTE_CONSTANTS.HOME}?${params.toString()}`);
    };


    // Use resolvedTheme for consistent server/client rendering
    const currentTheme = mounted ? resolvedTheme : "light";
    const isLight = currentTheme === "light";

    return (
        <div className="relative w-full min-h-screen bg-white dark:bg-[#0B0A1B]">
            {/* Desktop Layout - Split Screen */}
            <div className="flex h-screen">
                {/* Left Side - Form */}
                <div className="w-1/2 flex flex-col justify-center items-center px-12 bg-white dark:bg-[#0B0A1B]">
                    {/* Logo with yellow background */}
                    <div className="absolute top-8 left-8 bg-[#F4AA05] rounded-3xl p-3">
                        <Image
                            src="/logo.png"
                            alt="TooBikes Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                        />
                    </div>

                    <div className="w-full max-w-md">
                        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                            Find the right ride,
                        </h1>
                        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                            every time
                        </h1>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Pickup date & time</h4>
                                <PickupSelector
                                    pickup={true}
                                    date={pickupDate}
                                    time={pickupTime}
                                    onDateChange={setPickupDate}
                                    onTimeChange={setPickupTime}
                                    error={pickupError}
                                />
                            </div>

                            <div>
                                <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Drop date & time</h4>
                                <PickupSelector
                                    pickup={false}
                                    date={dropoffDate}
                                    time={dropoffTime}
                                    onDateChange={setDropoffDate}
                                    onTimeChange={setDropoffTime}
                                    error={dropoffError}
                                    minDate={pickupDate}
                                />
                            </div>

                            <Button
                                ref={buttonRef}
                                onClick={validateAndNavigate}
                                disabled={isRequestingLocation || storesLoading || !selectedStore || !pickupDate || !pickupTime || !dropoffDate || !dropoffTime}
                                className="w-full h-14 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] text-black font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRequestingLocation ? "Getting location..." : storesLoading ? "Loading..." : "Let's Drive"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Image with Padding */}
                <div className="w-1/2 relative bg-white dark:bg-[#0B0A1B] flex items-center justify-center p-8">
                    {/* Theme Toggle - Top Right Corner */}
                    <button
                        onClick={() => setTheme(isLight ? "dark" : "light")}
                        className="absolute top-8 right-8 z-10 p-3 rounded-full 
                            bg-black/70 text-white dark:bg-white/80 dark:text-black 
                            backdrop-blur shadow hover:scale-110 transition-transform"
                        aria-label="Toggle theme"
                    >
                        {isLight ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        )}
                    </button>

                    {/* Image Container with Padding and Rounded Corners */}
                    <div className="relative w-full h-[calc(100vh-6rem)] rounded-3xl overflow-hidden">
                        <Image
                            src={isLight ? "/landing/home_desktop_light.png" : "/landing/home_desktop_dark.png"}
                            alt="Scooter riders in city"
                            fill
                            className="object-contain  rounded-xl"
                            priority
                            suppressHydrationWarning
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
