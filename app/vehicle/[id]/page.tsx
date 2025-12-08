"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VehicleHeader from "./(components)/VehicleHeader";
import VehicleImageSlider from "./(components)/VehicleImageSlider";
import VehicleInfoCard from "./(components)/VehicleInfoCard";
import PickupDropSection from "./(components)/PickupDropSection";
import ReviewsSection from "./(components)/ReviewsSection";
import FAQAccordion from "./(components)/FAQAccordion";
import BottomCTA from "./(components)/BottomCTA";

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get pickup/drop details from URL params or use defaults
  const pickupDateParam = searchParams.get("pickupDate");
  const pickupTimeParam = searchParams.get("pickupTime");
  const dropDateParam = searchParams.get("dropDate");
  const dropTimeParam = searchParams.get("dropTime");
  const pickupLocationParam = searchParams.get("pickupLocation");
  const dropLocationParam = searchParams.get("dropLocation");

  // Mock vehicle data - replace with actual API call
  const vehicle = {
    _id: id,
    brand: "Honda",
    name: "Activa 6G",
    pricePerHour: 1400,
    pricePerDay: 700,
    fuelType: "petrol" as const,
    freeKilometers: 480,
    images: [
      "/bike.png",
      "/bike.png",
      "/bike.png",
    ],
  };

  // Default pickup/drop data
  const pickupDate = pickupDateParam
    ? new Date(pickupDateParam)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pickupTime = pickupTimeParam || "10:00 AM";
  const dropDate = dropDateParam
    ? new Date(dropDateParam)
    : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const dropTime = dropTimeParam || "10:00 AM";
  const pickupLocation =
    pickupLocationParam || "123 Main Street, City Center";
  const dropLocation = dropLocationParam || "123 Main Street, City Center";

  // Mock reviews
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

  // Mock FAQ items
  const faqItems = [
    {
      question: "What documents do I need?",
      answer: "You need a valid driving license and a government-issued ID proof for verification.",
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking up to 24 hours before pickup time for a full refund.",
    },
    {
      question: "What if I exceed free kilometers?",
      answer: "Additional charges of ₹5 per kilometer will apply for kilometers beyond the free limit.",
    },
    {
      question: "Is fuel included?",
      answer: "No, fuel is not included. The vehicle will be provided with a full tank, and you should return it with a full tank.",
    },
    {
      question: "What happens in case of damage?",
      answer: "Any damages will be assessed and charged accordingly. We recommend taking photos before and after the rental period.",
    },
  ];

  const handleBookNow = () => {
    // Navigate to booking page or trigger booking flow
    router.push(`/booking/${id}?pickupDate=${pickupDate.toISOString()}&dropDate=${dropDate.toISOString()}`);
  };

  const totalRent = vehicle.pricePerHour;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
      {/* Header */}
      <VehicleHeader />

      {/* Image Slider */}
      <div className="px-4 mt-2">
        <VehicleImageSlider
          images={vehicle.images || ["/bike.png"]}
          vehicleName={`${vehicle.brand} ${vehicle.name}`}
        />
      </div>

      {/* Vehicle Info Card */}
      <VehicleInfoCard
        brand={vehicle.brand}
        model={vehicle.name}
        price={vehicle.pricePerHour}
        pricePerDay={vehicle.pricePerDay}
        freeKilometers={vehicle.freeKilometers}
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
      <FAQAccordion items={faqItems} />

      {/* Bottom CTA */}
      <BottomCTA totalRent={totalRent} onBookNow={handleBookNow} />
    </div>
  );
}

