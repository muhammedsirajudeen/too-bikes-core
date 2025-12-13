import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/utils/jwt.utils";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface RefreshTokenResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    error?: string;
}

export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Get refresh token from HTTP-only cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
        return NextResponse.json({
            success: false,
            message: "No refresh token provided",
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    try {
        // Verify the refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired refresh token",
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        const phoneNumber = decoded.phoneNumber as string;

        // Generate new access token and refresh token
        const newAccessToken = generateAccessToken({ phoneNumber });
        const newRefreshToken = generateRefreshToken({ phoneNumber });

        // Create response
        const response = NextResponse.json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        }, { status: HttpStatus.OK });

        // Set new refresh token as HTTP-only cookie
        const isProduction = process.env.NODE_ENV === "production";
        response.cookies.set("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 8, // 8 days
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to refresh token",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: HttpStatus.UNAUTHORIZED });
    }
});
