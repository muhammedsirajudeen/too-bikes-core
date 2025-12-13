import { HttpStatus } from "@/constants/status.constant";
import { UserLicenseService } from "@/services/server/user.license.service";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { NextRequest, NextResponse } from "next/server";

export interface UploadLicenseResponse {
    success: boolean;
    message: string;
    licenseId?: string;
    error?: string;
}

const userLicenseService = new UserLicenseService();

export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Extract and verify JWT token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({
            success: false,
            message: "No authorization token provided",
        } as UploadLicenseResponse, { status: HttpStatus.UNAUTHORIZED });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the access token
    const decoded = verifyAccessToken(token);

    if (!decoded || typeof decoded === 'string') {
        return NextResponse.json({
            success: false,
            message: "Invalid or expired token",
        } as UploadLicenseResponse, { status: HttpStatus.UNAUTHORIZED });
    }

    // Extract user ID from token (JWT now contains id field)
    const userId = (decoded as { id?: string }).id;

    if (!userId) {
        return NextResponse.json({
            success: false,
            message: "Invalid token payload - user ID missing",
        } as UploadLicenseResponse, { status: HttpStatus.UNAUTHORIZED });
    }

    try {
        // Parse multipart form data
        const formData = await request.formData();

        const frontImage = formData.get("frontImage") as File | null;
        const backImage = formData.get("backImage") as File | null;

        // Validate that both images are provided
        if (!frontImage || !backImage) {
            return NextResponse.json({
                success: false,
                message: "Both front and back images are required",
            } as UploadLicenseResponse, { status: HttpStatus.BAD_REQUEST });
        }

        // Convert files to buffers
        const frontImageBuffer = Buffer.from(await frontImage.arrayBuffer());
        const backImageBuffer = Buffer.from(await backImage.arrayBuffer());

        // Call service layer to handle upload
        const result = await userLicenseService.uploadLicense({
            userId,
            frontImageBuffer,
            frontImageName: frontImage.name,
            frontImageType: frontImage.type,
            backImageBuffer,
            backImageName: backImage.name,
            backImageType: backImage.type,
        });

        // Return response based on service result
        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message,
                licenseId: result.licenseId,
            } as UploadLicenseResponse, { status: HttpStatus.OK });
        } else {
            return NextResponse.json({
                success: false,
                message: result.message,
            } as UploadLicenseResponse, { status: HttpStatus.BAD_REQUEST });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to upload license",
            error: error instanceof Error ? error.message : "Unknown error",
        } as UploadLicenseResponse, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
});
