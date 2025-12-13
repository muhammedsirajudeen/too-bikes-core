import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt.utils";
import { UserService } from "@/services/server/user.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Hardcoded OTP for now
const HARDCODED_OTP = "000111";

// Schema for OTP verification
const verifyOTPSchema = z.object({
    phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export interface VerifyOTPResponse {
    success: boolean;
    message: string;
    token?: string; // Access token in response body
    user?: {
        id: string;
        phoneNumber: string;
        role: string;
    };
    error?: Array<{ message?: string; path?: string[] }>;
}

const userService = new UserService();

export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
    const body = await request.json();
    const validated = verifyOTPSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid request",
            error: validated.error.issues
        }, { status: HttpStatus.BAD_REQUEST });
    }

    // Verify OTP matches hardcoded value
    if (validated.data.otp !== HARDCODED_OTP) {
        return NextResponse.json({
            success: false,
            message: "Invalid OTP",
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    // Find or create user by phone number
    const userResult = await userService.findOrCreateUser(validated.data.phoneNumber);

    if (!userResult.success || !userResult.user) {
        return NextResponse.json({
            success: false,
            message: userResult.message || "Failed to process user",
        }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }

    // Generate JWT tokens with user ID, phone number, and role
    const payload = {
        id: userResult.user.id,
        phoneNumber: userResult.user.phoneNumber,
        role: userResult.user.role,
    };
    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Create response with access token in body
    const response = NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        token, // Access token in response body for Authorization headers
        user: {
            id: userResult.user.id,
            phoneNumber: userResult.user.phoneNumber,
            role: userResult.user.role,
        },
    }, { status: HttpStatus.OK });

    // Set only refresh token as HTTP-only cookie (more secure)
    response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 24 * 60 * 60, // 8 days in seconds
        path: '/',
    });

    return response;
});
