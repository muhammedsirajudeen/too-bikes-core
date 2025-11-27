"use client";

import Image from "next/image";
import {
    Home,
    Heart,
    History,
    User,
    SlidersHorizontal,
    Calendar,
    MapPin,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "./(components)/navbar";
import { DrawerContent } from "@/components/ui/drawer";
import { useState } from "react";
import ComingSoonDrawer from "./(components)/drawer";

export default function HomePageContent() {
    const [open,setOpen]=useState(false)
    const handleClose=(status:boolean)=>{
        setOpen(status)
    }
    return (
        <div onClick={()=>{
            setOpen(true)
        }} className="min-h-screen w-full bg-white dark:bg-[#0B0A1B] text-black dark:text-white pb-24">

            {/* Top Banner */}
            <div className="w-full rounded-b-3xl bg-[#FDCB67] p-6 pt-10 relative overflow-hidden">
                <h1 className="text-3xl font-semibold">Good Morning</h1>
                <p className="text-gray-800 text-sm mt-1">Find your best ride here</p>

                {/* Banner Illustration */}
                <Image
                    src="/banner.png"
                    alt="banner"
                    width={180}
                    height={180}
                    className="absolute right-4 bottom-4"
                />

                {/* Search Row */}
                <div className="flex items-center gap-2 mt-8 relative z-10">
                    <div className="flex-1 rounded-full bg-white shadow-md py-3 px-4 flex items-center gap-2">
                        <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 text-sm font-medium">Kannur</span>
                    </div>

                    <div className="flex-1 rounded-full bg-white shadow-md py-3 px-4 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 text-sm font-medium">Pickup date</span>
                    </div>

                    <button className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0">
                        <SlidersHorizontal className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Vehicles Section */}
            <div className="px-4 mt-5">
                <h2 className="text-lg font-semibold">Available vehicles</h2>

                {/* Card 1 */}
                <Card className="mt-4 rounded-xl border shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <CardContent className="flex items-center gap-4 p-4">
                        <Image
                            src="/bike.png"
                            alt="bike"
                            width={155}
                            height={100}
                            className="object-contain"
                        />

                        <div className="flex-1">
                            <h3 className="font-semibold leading-tight">
                                Royal Enfield Hunter 350
                            </h3>
                            <p className="text-[#FF6B00] font-semibold mt-1">₹ 1400</p>
                            <p className="text-sm text-gray-500">₹ 700/day</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2 (Highlighted with bold border) */}
                <Card className="mt-4 rounded-xl border-2  shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <CardContent className="flex items-center gap-4 p-4">
                        <Image
                            src="/bike.png"
                            alt="bike"
                            width={155}
                            height={100}
                            className="object-contain"
                        />

                        <div className="flex-1">
                            <h3 className="font-semibold leading-tight">
                                Royal Enfield Hunter 350
                            </h3>
                            <p className="text-[#FF6B00] font-semibold mt-1">₹ 1400</p>
                            <p className="text-sm text-gray-500">₹ 700/day</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3 With Badge */}
                <Card className="mt-4 rounded-xl border relative shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <Badge className="absolute right-4 top-4 bg-red-500 text-white">
                        Most popular
                    </Badge>

                    <CardContent className="flex items-center gap-4 p-4">
                        <Image
                            src="/bike.png"
                            alt="scooter"
                            width={155}
                            height={100}
                            className="object-contain"
                        />

                        <div className="flex-1">
                            <h3 className="font-semibold leading-tight">River Indie</h3>
                            <p className="text-[#FF6B00] font-semibold mt-1">₹ 1400</p>
                            <p className="text-sm text-gray-500">₹ 700/day</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <ComingSoonDrawer open={open} setOpen={handleClose}/>
            {/* Bottom Navigation */}
            <Navbar />
        </div>
    );
}
