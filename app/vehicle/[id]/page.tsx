"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import VehicleImageSlider from "./(components)/VehicleImageSlider";
import VehicleInfoCard from "./(components)/VehicleInfoCard";
import PickupDropSection from "./(components)/PickupDropSection";
import ReviewsSection from "./(components)/ReviewsSection";
import FAQAccordion from "./(components)/FAQAccordion";
import BottomCTA from "./(components)/BottomCTA";
import AuthModal from "@/components/AuthModal";
import VehicleDetailSkeleton from "./(components)/VehicleDetailSkeleton";
import { IFAQ } from "@/core/interface/model/IFaq.model";
import { VehicleDetailResponse } from "@/app/api/v1/available-vehicles/[id]/route";
import { IStore } from "@/core/interface/model/IStore.model";
import { IVehicle } from "@/core/interface/model/IVehicle.model";

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [vehicle, setVehicle] = useState<IVehicle | null>(null);
  const [faqs, setFaqs] = useState<IFAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Get pickup/drop details from URL params or use defaults
  const pickupDateParam = searchParams.get("pickupDate");
  const pickupTimeParam = searchParams.get("pickupTime");
  const dropDateParam = searchParams.get("dropDate");
  const dropTimeParam = searchParams.get("dropTime");
  const pickupLocationParam = searchParams.get("pickupLocation");
  const dropLocationParam = searchParams.get("dropLocation");

  // Fetch vehicle details from API
  const fetchVehicleDetails = useCallback(async () => {
    if (!id) {
      setError("Vehicle ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get<VehicleDetailResponse>(
        `/api/v1/available-vehicles/${id}`
      );

      const data = response.data;

      if (!data.success) {
        if (data.error && Array.isArray(data.error)) {
          const errorMessages = data.error
            .map((err) => err.message || err.path?.join("."))
            .join(", ");
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError(data.message || "Failed to fetch vehicle details.");
        }
        setVehicle(null);
        setFaqs([]);
        setLoading(false);
        return;
      }

      if (!data.data || !data.data.vehicle) {
        setError("Vehicle not found.");
        setVehicle(null);
        setFaqs([]);
        setLoading(false);
        return;
      }

      setVehicle(data.data.vehicle);
      setFaqs(data.data.FAQ || []);
      setError("");
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: Array<{ message?: string; path?: string[] }>;
      }>;

      let errorMessage = "An error occurred while fetching vehicle details.";

      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorData = axiosError.response.data;

        if (errorData?.error && Array.isArray(errorData.error)) {
          const errorMessages = errorData.error
            .map((err) => err.message || err.path?.join("."))
            .join(", ");
          errorMessage = `Validation error: ${errorMessages}`;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (status === 404) {
          errorMessage = "Vehicle not found.";
        } else if (status >= 500) {
          errorMessage = `Server error (${status}). Please try again later.`;
        }
      } else if (axiosError.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      setError(errorMessage);
      setVehicle(null);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  // Default pickup/drop data
  const pickupDate = pickupDateParam
    ? new Date(pickupDateParam)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pickupTime = pickupTimeParam || "10:00 AM";
  const dropDate = dropDateParam
    ? new Date(dropDateParam)
    : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const dropTime = dropTimeParam || "10:00 AM";
  const pickupLocation = ` ${(vehicle?.store as IStore)?.address || ""}`;
  const dropLocation = ` ${(vehicle?.store as IStore)?.address || ""}`;

  // Mock reviews (until reviews API is available)
  const reviews = [
    {
      userName: "John Doe",
      rating: 5,
      comment: "Great bike, very smooth ride. Highly recommended!",
      date: "2 days ago",
    },
    {
      userName: "Jane Smith",
      rating: 4,
      comment: "Good condition and easy to handle. Would rent again.",
      date: "1 week ago",
    },
    {
      userName: "Mike Johnson",
      rating: 5,
      comment: "Perfect for city rides. Excellent service!",
      date: "2 weeks ago",
    },
  ];

  // Map FAQ items from API
  const faqItems = faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  const handleBookNow = () => {
    /**
     * @salman 
     * never fail silently ensure that the user is indicated
     */
    if (!vehicle) return;
    // Open the unified auth modal
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthComplete = (phoneNumber: string, otp: string) => {
    // Here you can verify the OTP with your backend
    console.log("Phone:", phoneNumber, "OTP:", otp);
    setIsAuthModalOpen(false);
    // Navigate to booking page after successful OTP verification
    router.push(
      `/booking/${id}?pickupDate=${pickupDate.toISOString()}&dropDate=${dropDate.toISOString()}&phone=${encodeURIComponent(phoneNumber)}`
    );
  };

  // Loading state
  if (loading) {
    return <VehicleDetailSkeleton />;
  }

  // Error state
  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
        <div className="px-4 mt-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Error Loading Vehicle
            </h2>
            <p className="text-red-600 dark:text-red-400">{error || "Vehicle not found"}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-red-600 dark:text-red-400 underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFavoriteToggle = (favorite: boolean) => {
    setIsFavorite(favorite);
    // You can add API call here to save favorite state
  };

  // const totalRent = vehicle.pricePerHour;
  const ms = dropDate.getTime() - pickupDate.getTime();
  const hours = ms / (1000 * 60 * 60);
  const days = ms / (1000 * 60 * 60 * 24);

  // Always charge daily rate
  const totalRent = vehicle.pricePerDay * Math.ceil(days);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
      {/* Image Slider with integrated controls */}
      <div className="px-4 mt-2">
        <VehicleImageSlider
          images={vehicle.image && vehicle.image.length > 0 ? vehicle.image : ["/bike.png"]}
          vehicleName={`${vehicle.brand} ${vehicle.name}`}
          isFavorite={isFavorite}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </div>

      {/* Vehicle Info Card */}
      <VehicleInfoCard
        brand={vehicle.brand}
        model={vehicle.name}
        price={vehicle.pricePerHour}
        pricePerDay={vehicle.pricePerDay}
        freeKilometers={480}
        fuelType={vehicle.fuelType}
      />

      {/* Pickup & Drop Section */}
      <PickupDropSection
        pickupDate={pickupDate}
        pickupTime={pickupTime}
        pickupLocation={pickupLocation}
        dropDate={dropDate}
        dropTime={dropTime}
        dropLocation={dropLocation}
      />

      {/* Reviews Section */}
      <ReviewsSection reviews={reviews} />

      {/* FAQ Section */}
      {faqItems.length > 0 && <FAQAccordion items={faqItems} />}

      {/* Bottom CTA */}
      <BottomCTA totalRent={totalRent} onBookNow={handleBookNow} />

      {/* Unified Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onComplete={handleAuthComplete}
      />
    </div>
  );
}

