"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const { resolvedTheme, setTheme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Form state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const currentTheme = mounted ? resolvedTheme : "light";
    const isLight = currentTheme === "light";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Basic validation
        if (!username || !password) {
            setError("Please enter both username and password");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/v1/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Login failed. Please try again.");
                setIsLoading(false);
                return;
            }

            // Store token and admin user data (including permissions) in localStorage
            if (data.token) {
                localStorage.setItem('admin_access_token', data.token);
            }

            if (data.admin) {
                localStorage.setItem('admin_user', JSON.stringify(data.admin));
            }

            // Redirect to admin dashboard
            router.push('/admin/dashboard');

        } catch {
            setError("Login failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-white dark:bg-[#0B0A1B]">
            {/* Mobile Layout */}
            <div className="md:hidden relative w-full min-h-screen">
                {/* Header Image */}
                <div className="fixed top-0 left-0 w-full h-[clamp(280px,40vh,400px)] z-0">
                    <Image
                        src={isLight ? "/day_wm.png" : "/night_wm.png"}
                        alt="Background"
                        fill
                        className="object-cover object-center"
                        priority
                        suppressHydrationWarning
                    />
                    {/* Logo */}
                    <div className="absolute top-3 left-3 z-10 bg-[#F4AA05] rounded-xl p-1.5">
                        <Image
                            src="/logo.png"
                            alt="TooBikes Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Login Form */}
                <div className="relative z-10 pt-[clamp(270px,38vh,390px)] flex flex-col items-center pb-0">
                    <div className="w-full rounded-t-3xl rounded-b-none border-none shadow-none dark:bg-[#0B0A1B] bg-white px-6 pt-8 pb-10">
                        <h2 className="text-[26px] font-medium mb-2">
                            Admin Login
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                            Sign in to access the admin panel
                        </p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="username-mobile" className="block text-sm font-medium mb-2">
                                    Username
                                </label>
                                <Input
                                    id="username-mobile"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    className="h-12 rounded-xl"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="password-mobile" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <Input
                                    id="password-mobile"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 rounded-xl"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] text-black font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#F4AA05] dark:hover:text-[#F4AA05] transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Split Screen */}
            <div className="hidden md:flex h-screen">
                {/* Left Side - Form */}
                <div className="w-1/2 flex flex-col justify-center items-center px-12 bg-white dark:bg-[#0B0A1B]">
                    {/* Logo */}
                    <div className="absolute top-8 left-8 bg-[#F4AA05] rounded-3xl p-3">
                        <Image
                            src="/logo.png"
                            alt="TooBikes Logo"
                            width={45}
                            height={45}
                            className="object-contain"
                        />
                    </div>

                    <div className="w-full max-w-md">
                        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                            Admin Login
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Sign in to access the admin panel
                        </p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="username-desktop" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Username
                                </label>
                                <Input
                                    id="username-desktop"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    className="h-14 rounded-xl text-base"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="password-desktop" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <Input
                                    id="password-desktop"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-14 rounded-xl text-base"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-full bg-[#F4AA05] hover:bg-[#cf9002] text-black font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#F4AA05] dark:hover:text-[#F4AA05] transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Image */}
                <div className="w-1/2 relative bg-white dark:bg-[#0B0A1B] flex items-center justify-center p-8">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(isLight ? "dark" : "light")}
                        className="absolute top-8 right-8 z-10 p-3 rounded-full 
              bg-black/70 text-white dark:bg-white/80 dark:text-black 
              backdrop-blur shadow hover:scale-110 transition-transform"
                        aria-label="Toggle theme"
                    >
                        {isLight ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        )}
                    </button>

                    {/* Image Container */}
                    <div className="relative w-full h-[calc(100vh-6rem)] rounded-3xl overflow-hidden">
                        <Image
                            src={isLight ? "/landing/home_desktop_light.png" : "/landing/home_desktop_dark.png"}
                            alt="Admin panel preview"
                            fill
                            className="object-contain rounded-xl"
                            priority
                            suppressHydrationWarning
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}