import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Decode JWT token without verification (Edge Runtime compatible)
 * Note: This only decodes the payload, actual verification happens in API routes
 */
function decodeToken(token: string): { role?: string; id?: string } | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow access to login page
    if (pathname === '/admin/login') {
        // If already has token, redirect to dashboard
        const token = request.cookies.get('admin_refresh_token')?.value;

        if (token) {
            const payload = decodeToken(token);
            if (payload && payload.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
        }
        return NextResponse.next();
    }

    // Protect all other /admin/* routes
    if (pathname.startsWith('/admin')) {
        // Check for token in cookies
        const token = request.cookies.get('admin_refresh_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Decode token (not verifying signature here, just checking structure)
        const payload = decodeToken(token);

        if (!payload || payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Token exists and has admin role, allow access
        // Full verification will happen in API routes
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
