"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
    id: string;
    username: string;
    role: string;
    permissions: string[];
}

interface AdminAuthContextType {
    admin: AdminUser | null;
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    isLoading: boolean;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for stored admin data and token
        const token = localStorage.getItem('admin_access_token');
        const storedAdmin = localStorage.getItem('admin_user');

        if (token && storedAdmin) {
            try {
                const adminData = JSON.parse(storedAdmin);
                setAdmin(adminData);
                setPermissions(adminData.permissions || []);
            } catch (error) {
                console.error('Failed to parse admin data:', error);
                localStorage.removeItem('admin_access_token');
                localStorage.removeItem('admin_user');
            }
        }

        setIsLoading(false);
    }, []);

    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        return requiredPermissions.some(p => permissions.includes(p));
    };

    const hasAllPermissions = (requiredPermissions: string[]): boolean => {
        return requiredPermissions.every(p => permissions.includes(p));
    };

    const logout = async () => {
        try {
            await fetch('/api/v1/admin/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout API error:', error);
        }
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        setAdmin(null);
        setPermissions([]);
        router.push('/');
    };

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                permissions,
                hasPermission,
                hasAnyPermission,
                hasAllPermissions,
                isLoading,
                logout,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
}
