"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PickupSelector from "./pickup";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import ROUTE_CONSTANTS from "@/constants/routeConstants";

export default function LandingPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router=useRouter()
    useEffect(() => {
         
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) return null;
    const navHandler=()=>{
        router.push(ROUTE_CONSTANTS.HOME)
    }
    return (
        <div className="w-full min-h-screen bg-[#ffffff] dark:bg-[#0B0A1B] flex flex-col items-center">

            {/* THEME TOGGLE BUTTON */}
            <Button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="absolute top-4 right-4 z-20 p-2 rounded-full 
                        bg-black/70 text-white dark:bg-white/80 dark:text-black 
                        backdrop-blur shadow"
            >
                {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                ) : (
                    <Sun className="h-5 w-5" />
                )}
            </Button>

            {/* Banner */}
            <div className="w-full relative h-[420px]">
                <Image
                    src={theme === "light" ? "/day_wm.png" : "/night_wm.png"}
                    alt="Scooter"
                    fill
                    className="object-cover object-top transition-all duration-300"
                    priority
                />
            </div>

            {/* Card */}
            <Card style={{ marginTop: -20, zIndex: 1 }} className="-mt-12 w-full dark:bg-[#0B0A1B] max-w-xl shadow-xl rounded-3xl border-none">
                <CardContent className="pt-4 px-6 pb-10">

                    <h2 className="text-[26px] font-medium">
                        Find the right ride, <br /> every time
                    </h2>

                    <h4 className="font-light m-3 mt-10">Select Your pick time</h4>
                    <PickupSelector pickup={true} />

                    <h4 className="font-light m-3">Select your dropoff time</h4>
                    <PickupSelector pickup={false} />

                    <Button onClick={navHandler}  className="w-full h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] mt-24 text-black font-semibold text-lg">
                        Let&apos;s Drive
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
