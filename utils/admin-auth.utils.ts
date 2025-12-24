/**
 * Admin Authentication Utilities
 * Client-side helper functions for managing admin JWT tokens
 */

const ADMIN_TOKEN_KEY = 'admin_access_token';

/**
 * Store admin access token in localStorage
 */
export function setAdminToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
}

/**
 * Retrieve admin access token from localStorage
 */
export function getAdminToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
}

/**
 * Remove admin access token from localStorage
 */
export function removeAdminToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
}

/**
 * Check if admin is authenticated (has valid token)
 * Note: This only checks if token exists, not if it's valid
 */
export function isAdminAuthenticated(): boolean {
    return !!getAdminToken();
}

/**
 * Decode JWT token to get payload (without verification)
 */
export function decodeAdminToken(token: string): { id: string; username: string; role: string } | null {
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
        console.error('Failed to decode token:', error);
        return null;
    }
}
