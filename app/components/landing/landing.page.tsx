"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import PickupSelector from "./pickup";
import { ThemeToggle } from "../ThemeToggle";

import { useRouter } from "next/navigation";
import ROUTE_CONSTANTS from "@/constants/routeConstants";
import { IStore } from "@/core/interface/model/IStore.model";


export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pickup state
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);

  // Dropoff state
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [dropoffTime, setDropoffTime] = useState<string | null>(null);

  // Validation errors
  const [pickupError, setPickupError] = useState<string>("");
  const [dropoffError, setDropoffError] = useState<string>("");
  const [locationError, setLocationError] = useState<string | null>(null);

  // Location state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Store state
  const [stores, setStores] = useState<IStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
  const [storesLoading, setStoresLoading] = useState(true);

  // Ref for scrolling to button
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Scroll handler for when date/time pickers open
  const scrollToButton = () => {
    setTimeout(() => {
      buttonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

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
        setStores(data.data);
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
      setLocationError("Geolocation is not supported by your browser");
      return null;
    }

    setIsRequestingLocation(true);
    setLocationError("");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          setIsRequestingLocation(false);
          resolve({ lat, lng });
        },
        (error) => {
          setIsRequestingLocation(false);
          let errorMsg = "Unable to get your location";
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
          setLocationError(errorMsg);
          resolve(null);
        }
      );
    });
  };

  const validateAndNavigate = async () => {
    // Reset errors
    setPickupError("");
    setDropoffError("");
    setLocationError("");

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
      <ThemeToggle />

      {/* FIXED RESPONSIVE HEADER IMAGE */}
      <div className="fixed top-0 left-0 w-full h-[clamp(320px,45vh,500px)] z-0">
        <Image
          src={isLight ? "/day_wm.png" : "/night_wm.png"}
          alt="Scooter"
          fill
          className="object-cover object-top"
          priority
          suppressHydrationWarning
        />
        {/* Logo in top-left corner */}
        <div className="absolute top-4 left-4 z-10">
          <Image
            src="/logo.png"
            alt="TooBikes Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>
      </div>



      {/* SCROLL CONTENT BELOW THE HEADER IMAGE */}
      <div className="relative z-10 pt-[clamp(310px,42vh,490px)] flex flex-col items-center pb-0">
        <Card className="w-full max-w-xl rounded-t-3xl rounded-b-none border-none shadow-none dark:bg-[#0B0A1B] bg-white">
          <CardContent className="pt-4 px-6 pb-10">
            <h2 className="text-[26px] font-medium">
              Find the right ride, <br /> every time
            </h2>

            <h4 className="font-light m-3 mt-10">Select your pick time</h4>
            <PickupSelector
              pickup={true}
              date={pickupDate}
              time={pickupTime}
              onDateChange={setPickupDate}
              onTimeChange={setPickupTime}
              error={pickupError}
              onOpen={scrollToButton}
            />

            <h4 className="font-light m-3">Select your dropoff time</h4>
            <PickupSelector
              pickup={false}
              date={dropoffDate}
              time={dropoffTime}
              onDateChange={setDropoffDate}
              onTimeChange={setDropoffTime}
              error={dropoffError}
              minDate={pickupDate}
              onOpen={scrollToButton}
            />


            <Button
              ref={buttonRef}
              onClick={validateAndNavigate}
              disabled={isRequestingLocation || storesLoading || !selectedStore || !pickupDate || !pickupTime || !dropoffDate || !dropoffTime}
              className="w-full h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] mt-24 text-black font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequestingLocation ? "Getting location..." : storesLoading ? "Loading..." : "Let's Drive"}
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
