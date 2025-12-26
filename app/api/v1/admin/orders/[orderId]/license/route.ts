import { HttpStatus } from "@/constants/status.constant";
import { getPresignedUrl } from "@/utils/s3.utils";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { requirePermission } from "@/middleware/permission.middleware";
import { Permission } from "@/constants/permissions.constant";
import { NextRequest, NextResponse } from "next/server";

export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.ORDER_VIEW, async (
        request: NextRequest,
        _admin,
        context: { params: Promise<{ orderId: string }> }
    ) => {
        // Await params in Next.js 15
        const { orderId } = await context.params;

        const { searchParams } = new URL(request.url);
        const frontKey = searchParams.get("frontKey");
        const backKey = searchParams.get("backKey");

        if (!frontKey || !backKey) {
            return NextResponse.json(
                { success: false, message: "Missing license keys" },
                { status: HttpStatus.BAD_REQUEST }
            );
        }

        try {
            const [frontUrl, backUrl] = await Promise.all([
                getPresignedUrl(frontKey),
                getPresignedUrl(backKey),
            ]);

            return NextResponse.json({
                success: true,
                data: {
                    frontUrl,
                    backUrl,
                },
            }, { status: HttpStatus.OK });
        } catch (error) {
            console.error("Error generating presigned URLs:", error);
            return NextResponse.json({
                success: false,
                message: "Failed to generate license URLs",
            }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
        }
    })
);
