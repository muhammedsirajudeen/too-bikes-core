"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

interface AuthContextType {
    isAuthenticated: boolean;
    phoneNumber: string | null;
    requireAuth: (intendedPath: string) => void;
    checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [intendedDestination, setIntendedDestination] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

    const checkAuth = useCallback(() => {
        if (typeof window === "undefined") return false;
        const token = localStorage.getItem("auth_token");
        return !!token;
    }, []);

    // Load phone number from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedPhone = localStorage.getItem("auth_phone");
            if (storedPhone) {
                setPhoneNumber(storedPhone);
            }
        }
    }, []);

    const requireAuth = useCallback((intendedPath: string) => {
        const isAuth = checkAuth();

        if (!isAuth) {
            // User is not authenticated, show modal and save intended destination
            setIntendedDestination(intendedPath);
            setIsAuthModalOpen(true);
        } else {
            // User is already authenticated, navigate directly
            router.push(intendedPath);
        }
    }, [checkAuth, router]);

    const handleAuthComplete = useCallback((phone: string, otp: string) => {
        // Close the modal
        setIsAuthModalOpen(false);

        // Store phone number
        setPhoneNumber(phone);
        if (typeof window !== "undefined") {
            localStorage.setItem("auth_phone", phone);
        }

        // Navigate to intended destination if set
        if (intendedDestination) {
            router.push(intendedDestination);
            setIntendedDestination(null);
        }
    }, [intendedDestination, router]);

    const handleAuthModalClose = useCallback(() => {
        setIsAuthModalOpen(false);
        setIntendedDestination(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: checkAuth(),
                phoneNumber,
                requireAuth,
                checkAuth,
            }}
        >
            {children}

            {/* Global AuthModal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={handleAuthModalClose}
                onComplete={handleAuthComplete}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
