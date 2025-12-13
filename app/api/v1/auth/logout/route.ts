import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import logger from "@/utils/logger.utils";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Clear the refresh token cookie
        cookieStore.delete("refresh_token");

        logger.info("User logged out successfully");

        return NextResponse.json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        logger.error("Error during logout:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to logout",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
