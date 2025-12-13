import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for phone number validation (Indian phone numbers)
const generateOTPSchema = z.object({
    phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
});

export interface GenerateOTPResponse {
    success: boolean;
    message: string;
    error?: Array<{ message?: string; path?: string[] }>;
}

export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
    const body = await request.json();
    const validated = generateOTPSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid phone number",
            error: validated.error.issues
        }, { status: HttpStatus.BAD_REQUEST });
    }

    // For now, we're hardcoding the OTP as 000111 and not storing it
    // In a real implementation, you would:
    // 1. Generate a random OTP
    // 2. Store it in a database or cache with expiration
    // 3. Send it via SMS/WhatsApp to the user

    return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
    }, { status: HttpStatus.OK });
});
