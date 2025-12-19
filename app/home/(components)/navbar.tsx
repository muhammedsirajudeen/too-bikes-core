"use client";

import { Home, Heart, User, History } from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Navbar() {
  const { requireAuth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Save query params when on /home page
  useEffect(() => {
    if (pathname === "/home" && searchParams.toString()) {
      sessionStorage.setItem("homeQueryParams", searchParams.toString());
    }
  }, [pathname, searchParams]);

  const handleHomeClick = () => {
    // Restore saved query params when returning to home
    const savedParams = sessionStorage.getItem("homeQueryParams");
    if (savedParams) {
      router.push(`/home?${savedParams}`);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="
      fixed bottom-0 left-0 w-full 
      bg-white dark:bg-[#131224]
      shadow-[0_-4px_12px_rgba(0,0,0,0.15)]
      rounded-tl-2xl rounded-tr-2xl
      py-2 flex justify-around
      md:hidden
    ">
      <button
        onClick={handleHomeClick}
        className={`flex flex-col items-center transition-colors ${pathname === "/home" ? "text-[#FF6B00]" : "text-gray-400 hover:text-[#FF6B00]"
          }`}
      >
        <Home className="w-6 h-6" />
        <p className="text-xs mt-1">Home</p>
      </button>

      <button
        onClick={() => requireAuth("/favorites")}
        className={`flex flex-col items-center transition-colors ${pathname === "/favorites" ? "text-[#FF6B00]" : "text-gray-400 hover:text-[#FF6B00]"
          }`}
      >
        <Heart className="w-6 h-6" />
        <p className="text-xs mt-1">Favorite</p>
      </button>

      <button
        onClick={() => requireAuth("/orders")}
        className={`flex flex-col items-center transition-colors ${pathname === "/orders" ? "text-[#FF6B00]" : "text-gray-400 hover:text-[#FF6B00]"
          }`}
      >
        <History className="w-6 h-6" />
        <p className="text-xs mt-1">Order History</p>
      </button>

      <button
        onClick={() => {
          requireAuth("/profile");
        }}
        className={`flex flex-col items-center transition-colors ${pathname === "/profile" ? "text-[#FF6B00]" : "text-gray-400 hover:text-[#FF6B00]"
          }`}
      >
        <User className="w-6 h-6" />
        <p className="text-xs mt-1">Profile</p>
      </button>
    </div>
  );
}
