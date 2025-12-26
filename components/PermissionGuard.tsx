"use client";

import { useAdminAuth } from "@/contexts/admin-auth.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PermissionGuardProps {
    children: React.ReactNode;
    permission?: string;
    anyPermissions?: string[];
    allPermissions?: string[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 * 
 * Usage:
 * <PermissionGuard permission="user.view">
 *   <UsersTable />
 * </PermissionGuard>
 */
export function PermissionGuard({
    children,
    permission,
    anyPermissions,
    allPermissions,
    fallback = null,
    redirectTo,
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && redirectTo) {
            let hasAccess = true;

            if (permission && !hasPermission(permission)) {
                hasAccess = false;
            }

            if (anyPermissions && !hasAnyPermission(anyPermissions)) {
                hasAccess = false;
            }

            if (allPermissions && !hasAllPermissions(allPermissions)) {
                hasAccess = false;
            }

            if (!hasAccess) {
                router.push(redirectTo);
            }
        }
    }, [isLoading, permission, anyPermissions, allPermissions, redirectTo, router, hasPermission, hasAnyPermission, hasAllPermissions]);

    if (isLoading) {
        return null;
    }

    // Check permission
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    // Check any permissions
    if (anyPermissions && !hasAnyPermission(anyPermissions)) {
        return <>{fallback}</>;
    }

    // Check all permissions
    if (allPermissions && !hasAllPermissions(allPermissions)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
