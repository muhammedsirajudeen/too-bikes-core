import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { UserLicenseService } from "@/services/server/user.license.service";
import { NextRequest, NextResponse } from "next/server";

export interface CheckLicenseResponse {
    success: boolean;
    message: string;
    hasLicense: boolean;
    error?: string;
}

const licenseService = new UserLicenseService();

export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({
            success: false,
            message: "No authorization token provided",
            hasLicense: false,
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
                hasLicense: false,
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        // Extract userId from token
        const userId = decoded.id;

        if (!userId) {
            console.error("Token payload missing userId:", decoded);
            return NextResponse.json({
                success: false,
                message: "Invalid token payload - please log in again",
                hasLicense: false,
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        console.log("Checking license for userId:", userId);

        // Check if user has uploaded license
        const licenseResult = await licenseService.getUserLicense(userId);

        return NextResponse.json({
            success: true,
            message: "License check completed",
            hasLicense: licenseResult.success,
        }, { status: HttpStatus.OK });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to check license status",
            hasLicense: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
});
