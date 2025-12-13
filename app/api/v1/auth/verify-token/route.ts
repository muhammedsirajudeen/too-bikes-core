import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { NextRequest, NextResponse } from "next/server";

export interface VerifyTokenResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        phoneNumber: string;
    };
    error?: string;
}

export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({
            success: false,
            message: "No authorization token provided",
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
        // Verify the access token
        const decoded = verifyAccessToken(token);

        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired token",
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        // Token is valid, return user info
        return NextResponse.json({
            success: true,
            message: "Token is valid",
            user: {
                id: decoded.id,
                phoneNumber: decoded.phoneNumber,
            },
        }, { status: HttpStatus.OK });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Invalid token",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: HttpStatus.UNAUTHORIZED });
    }
});
