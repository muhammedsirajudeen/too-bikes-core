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
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navHandler = () => {
    router.push(ROUTE_CONSTANTS.HOME);
  };

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-[#0B0A1B]">

      {/* FIXED RESPONSIVE HEADER IMAGE */}
      <div className="fixed top-0 left-0 w-full h-[clamp(320px,45vh,500px)] z-0">
        <Image
          src={theme === "light" ? "/day_wm.png" : "/night_wm.png"}
          alt="Scooter"
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* FIXED THEME TOGGLE */}
      <Button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="fixed top-4 right-4 z-30 p-2 rounded-full 
          bg-black/70 text-white dark:bg-white/80 dark:text-black 
          backdrop-blur shadow"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      {/* SCROLL CONTENT BELOW THE HEADER IMAGE */}
      <div className="relative z-10 pt-[clamp(310px,42vh,490px)]  flex flex-col items-center pb-10">
        <Card className="w-full max-w-xl shadow-xl rounded-3xl border-none dark:bg-[#0B0A1B]">
          <CardContent className="pt-4 px-6 pb-10">

            <h2 className="text-[26px] font-medium">
              Find the right ride, <br /> every time
            </h2>

            <h4 className="font-light m-3 mt-10">Select your pick time</h4>
            <PickupSelector pickup={true} />

            <h4 className="font-light m-3">Select your dropoff time</h4>
            <PickupSelector pickup={false} />

            <Button
              onClick={navHandler}
              className="w-full h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] mt-24 text-black font-semibold text-lg"
            >
              Let&apos;s Drive
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
