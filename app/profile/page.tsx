"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { User, Phone, Mail, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/app/home/(components)/navbar";
import { ThemeToggle } from "@/app/components/ThemeToggle";

// Prevent static generation since this page requires authentication
export const dynamic = 'force-dynamic';

interface UserProfile {
    id: string;
    phoneNumber: string;
    role: string;
    name?: string;
    email?: string;
    isBlocked?: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get("/api/v1/user/profile");

            if (response.data.success) {
                setProfile(response.data.data);
            } else {
                setError(response.data.message || "Failed to fetch profile");
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Failed to load profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            // Call logout API to clear refresh token
            await axiosInstance.post("/api/v1/auth/logout");

            // Clear access token from localStorage
            localStorage.removeItem("auth_token");

            // Redirect to root page
            router.push("/");
        } catch (err) {
            console.error("Error during logout:", err);
            // Even if API fails, clear local token and redirect
            localStorage.removeItem("auth_token");
            router.push("/");
        } finally {
            setLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A1B] pb-28">
                <ThemeToggle />

                {/* Header Skeleton */}
                <div className="bg-white dark:bg-[#131224] pt-12 pb-20 px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 skeleton" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-56 skeleton" />
                    </div>
                </div>

                {/* Profile Card Skeleton */}
                <div className="max-w-2xl mx-auto px-4 -mt-12">
                    <Card className="rounded-2xl shadow-lg overflow-hidden">
                        <CardContent className="p-0">
                            {/* Avatar Section Skeleton */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full skeleton" />
                                    <div className="flex-1">
                                        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 skeleton" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 skeleton" />
                                    </div>
                                </div>
                            </div>

                            {/* Profile Information Skeleton */}
                            <div className="p-6 space-y-4">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 skeleton" />

                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-[#1A1A2E] rounded-lg">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 skeleton" />
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 skeleton" />
                                    </div>
                                ))}
                            </div>

                            {/* Logout Button Skeleton */}
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Suspense fallback={<div className="h-20" />}>
                    <Navbar />
                </Suspense>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A1B] flex items-center justify-center p-4 pb-28">
                <ThemeToggle />
                <div className="bg-white dark:bg-[#131224] rounded-2xl p-6 max-w-md w-full">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Error Loading Profile
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={fetchProfile}
                            className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <Suspense fallback={<div className="h-20" />}>
                    <Navbar />
                </Suspense>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A1B] pb-28">
            <ThemeToggle />

            {/* Header */}
            <div className="bg-white dark:bg-[#131224] pt-12 pb-20 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="max-w-2xl mx-auto px-4 -mt-12">
                <div className="bg-white dark:bg-[#131224] rounded-2xl shadow-lg overflow-hidden">
                    {/* Avatar Section */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {profile?.name || "User"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {profile?.role || "Client"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Account Information
                        </h3>

                        {/* Phone Number */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1A1A2E] rounded-lg">
                            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                                <p className="text-base font-medium text-gray-900 dark:text-white">
                                    +91 {profile?.phoneNumber}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        {profile?.email && (
                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1A1A2E] rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        {profile?.name && (
                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1A1A2E] rounded-lg">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {profile.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Account Status */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1A1A2E] rounded-lg">
                            <div className="w-5 h-5 mt-0.5">
                                <div className={`w-3 h-3 rounded-full ${profile?.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                                <p className="text-base font-medium text-gray-900 dark:text-white">
                                    {profile?.isBlocked ? "Blocked" : "Active"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                        >
                            {loggingOut ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Logging out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <Suspense fallback={<div className="h-20" />}>
                <Navbar />
            </Suspense>
        </div>
    );
}
