"use client";

import { Home, Heart, User, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";

export default function Navbar() {
  const router = useRouter();
  const { requireAuth } = useAuth();

  return (
    <div className="
      fixed bottom-0 left-0 w-full 
      bg-white dark:bg-[#131224]
      shadow-[0_-4px_12px_rgba(0,0,0,0.15)]
      rounded-tl-2xl rounded-tr-2xl
      py-2 flex justify-around
    ">
      <div className="flex flex-col items-center text-[#FF6B00]">
        <Home className="w-6 h-6" />
        <p className="text-xs mt-1">Home</p>
      </div>

      <div className="flex flex-col items-center text-gray-400">
        <Heart className="w-6 h-6" />
        <p className="text-xs mt-1">Favorite</p>
      </div>

      <div className="flex flex-col items-center text-gray-400">
        <History className="w-6 h-6" />
        <p className="text-xs mt-1">Order History</p>
      </div>

      <button
        onClick={() => {
          requireAuth();
          // If user is authenticated, navigate to profile
          // If not, modal will show and close after auth
          const token = localStorage.getItem("auth_token");
          if (token) {
            router.push("/profile");
          }
        }}
        className="flex flex-col items-center text-gray-400 hover:text-[#FF6B00] transition-colors"
      >
        <User className="w-6 h-6" />
        <p className="text-xs mt-1">Profile</p>
      </button>
    </div>
  );
}
