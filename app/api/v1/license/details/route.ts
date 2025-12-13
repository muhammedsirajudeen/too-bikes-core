import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { UserLicenseService } from "@/services/server/user.license.service";
import { generateSignedUrl } from "@/utils/s3Storage.utils";
import { NextRequest, NextResponse } from "next/server";

export interface GetLicenseResponse {
    success: boolean;
    message: string;
    data?: {
        frontImageUrl: string;
        backImageUrl: string;
    };
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

        // Extract userId from token
        const userId = decoded.id;

        if (!userId) {
            console.error("Token payload missing userId:", decoded);
            return NextResponse.json({
                success: false,
                message: "Invalid token payload - please log in again",
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        console.log("Fetching license for userId:", userId);

        // Get user's license
        const licenseResult = await licenseService.getUserLicense(userId);

        if (!licenseResult.success || !licenseResult.data) {
            return NextResponse.json({
                success: false,
                message: licenseResult.message || "License not found",
            }, { status: HttpStatus.NOT_FOUND });
        }

        // Generate pre-signed URLs for both images (valid for 1 hour)
        const frontImageUrl = await generateSignedUrl(licenseResult.data.frontImage, 60 * 60);
        const backImageUrl = await generateSignedUrl(licenseResult.data.backImage, 60 * 60);

        return NextResponse.json({
            success: true,
            message: "License retrieved successfully",
            data: {
                frontImageUrl,
                backImageUrl,
            },
        }, { status: HttpStatus.OK });
    } catch (error) {
        console.error("Error fetching license:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch license",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
});
