"use client";

import { Home, Heart, ShoppingBag, User, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Topbar() {
    const { requireAuth } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLight = mounted ? theme === "light" : true;

    return (
        <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white dark:bg-[#0B0A1B]">
            <div className="w-full px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Image
                        src="/log.jpg"
                        alt="TooBike Logo"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    />
                    <span className="text-xl font-bold text-gray-800 dark:text-white">TooBikes</span>
                </div>

                {/* Navigation Items */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => router.push("/home")}
                        className="flex items-center gap-2 text-[#FF6B00] hover:text-[#FF8533] transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Home</span>
                    </button>

                    <button
                        onClick={() => requireAuth("/favorites")}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors"
                    >
                        <Heart className="w-5 h-5" />
                        <span className="font-medium">Favorites</span>
                    </button>

                    <button
                        onClick={() => requireAuth("/orders")}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-medium">My Orders</span>
                    </button>
                </div>

                {/* Right Section: Theme Toggle + Profile */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(isLight ? "dark" : "light")}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        suppressHydrationWarning
                    >
                        {isLight ? (
                            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        ) : (
                            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        )}
                    </button>

                    {/* Profile Section */}
                    <button
                        onClick={() => requireAuth("/profile")}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
