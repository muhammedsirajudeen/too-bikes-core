"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import PickupSelector from "./pickup";
import { useTheme } from "@/app/provider/theme.provider";

export default function LandingPage() {
    const theme=useTheme()
    const [pickupDate, setPickupDate] = useState<Date | undefined>();
    const [pickupTime, setPickupTime] = useState<string | undefined>();
    const [dropDate, setDropDate] = useState<Date | undefined>();
    const [dropTime, setDropTime] = useState<string | undefined>();
    return (
        <div className="w-full min-h-screen bg-[#ffffff] dark:bg-dark flex flex-col items-center">
            {/* Banner */}
            <div className="w-full relative h-[420px]">
                <Image
                    src="/day_wm.png"
                    alt="Scooter"
                    fill
                    className="object-cover object-top"
                    priority
                />
            </div>

            {/* White Card */}
            <Card style={{ marginTop: -20, zIndex: 1 }} className="-mt-12 w-full max-w-xl shadow-xl rounded-3xl border-none">
                <CardContent className="pt-4 px-6 pb-10">
                    {/* Title */}
                    <h2 className="text-[26px] font-medium">
                        Find the right ride, <br /> every time
                    </h2>
                    <h4 className="font-light m-3" >Select Your pickup time</h4>
                    <PickupSelector pickup={true} />
                    <h4 className="font-light m-3" >Select your dropoff time</h4>
                    <PickupSelector pickup={false} />
                    {/* CTA Button */}
                    <Button className="w-full  h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] mt-32 text-black font-semibold text-lg">
                        Let&apos;s Drive
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
