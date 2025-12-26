/**
 * Permission Middleware
 * Validates that authenticated admin has required permissions
 */

import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "@/constants/status.constant";
import { Permission, getPermissionsForRole, AdminRole } from "@/constants/permissions.constant";

export interface AdminTokenPayload {
    id: string;
    username: string;
    role: AdminRole;
    permissions?: Permission[];
}

export interface PermissionCheckResult {
    authorized: boolean;
    admin?: AdminTokenPayload;
    message?: string;
}

/**
 * Decode and validate admin JWT token
 */
function decodeAdminToken(token: string): AdminTokenPayload | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode admin token:', error);
        return null;
    }
}

/**
 * Check if admin has required permission
 */
export function checkPermission(
    request: NextRequest,
    requiredPermission: Permission
): PermissionCheckResult {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            authorized: false,
            message: "No authorization token provided",
        };
    }

    const token = authHeader.split(' ')[1];
    const payload = decodeAdminToken(token);

    if (!payload) {
        return {
            authorized: false,
            message: "Invalid token",
        };
    }

    // Get permissions for the admin's role
    const permissions = getPermissionsForRole(payload.role);

    // Check if admin has the required permission
    if (!permissions.includes(requiredPermission)) {
        return {
            authorized: false,
            admin: payload,
            message: `Insufficient permissions. Required: ${requiredPermission}`,
        };
    }

    return {
        authorized: true,
        admin: payload,
    };
}

/**
 * Middleware wrapper to require specific permission
 * Usage: requirePermission(Permission.USER_VIEW, async (request, admin) => {...})
 * For dynamic routes: requirePermission(Permission.USER_VIEW, async (request, admin, context) => {...})
 */
export function requirePermission<T = any>(
    permission: Permission,
    handler: (request: NextRequest, admin: AdminTokenPayload, ...args: any[]) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
        const result = checkPermission(request, permission);

        if (!result.authorized) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message || "Unauthorized",
                },
                { status: HttpStatus.FORBIDDEN }
            );
        }

        // Pass the admin payload and any additional arguments (like context for dynamic routes)
        return handler(request, result.admin!, ...args);
    };
}

/**
 * Middleware wrapper to require ANY of the specified permissions
 */
export function requireAnyPermission(
    permissions: Permission[],
    handler: (request: NextRequest, admin: AdminTokenPayload) => Promise<NextResponse>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No authorization token provided",
                },
                { status: HttpStatus.FORBIDDEN }
            );
        }

        const token = authHeader.split(' ')[1];
        const payload = decodeAdminToken(token);

        if (!payload) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid token",
                },
                { status: HttpStatus.FORBIDDEN }
            );
        }

        const adminPermissions = getPermissionsForRole(payload.role);
        const hasAnyPermission = permissions.some(p => adminPermissions.includes(p));

        if (!hasAnyPermission) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Insufficient permissions. Required one of: ${permissions.join(', ')}`,
                },
                { status: HttpStatus.FORBIDDEN }
            );
        }

        return handler(request, payload);
    };
}
