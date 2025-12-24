import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "@/constants/status.constant";

/**
 * Admin Logout Endpoint
 * Clears the admin refresh token cookie
 */
export async function POST(_request: NextRequest) {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully"
    }, { status: HttpStatus.OK });

    // Clear the refresh token cookie
    response.cookies.set('admin_refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
    });

    return response;
}
