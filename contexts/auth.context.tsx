"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

interface AuthContextType {
    isAuthenticated: boolean;
    requireAuth: (intendedPath: string) => void;
    checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

    const checkAuth = useCallback(() => {
        if (typeof window === "undefined") return false;
        const token = localStorage.getItem("auth_token");
        return !!token;
    }, []);

    const requireAuth = useCallback(() => {
        const isAuth = checkAuth();

        if (!isAuth) {
            // User is not authenticated, show modal
            setIsAuthModalOpen(true);
        }
        // If authenticated, do nothing - let the caller handle navigation
    }, [checkAuth]);

    const handleAuthComplete = useCallback(() => {
        // Just close the modal after successful auth
        // User stays on current page and can decide where to go
        setIsAuthModalOpen(false);
        setIntendedDestination(null);
    }, []);

    const handleAuthModalClose = useCallback(() => {
        setIsAuthModalOpen(false);
        setIntendedDestination(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: checkAuth(),
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
