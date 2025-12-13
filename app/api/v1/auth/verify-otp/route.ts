import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
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
    error?: Array<{ message?: string; path?: string[] }>;
}

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

    // In a real implementation, you would:
    // 1. Check if OTP exists in database/cache
    // 2. Verify it hasn't expired
    // 3. Mark it as used
    // 4. Create user session/token

    return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
    }, { status: HttpStatus.OK });
});
