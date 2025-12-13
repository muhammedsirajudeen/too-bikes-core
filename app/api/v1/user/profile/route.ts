import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/server/user.service";
import { verifyAccessToken } from "@/utils/jwt.utils";
import logger from "@/utils/logger.utils";

const userService = new UserService();

export async function GET(req: NextRequest) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, message: "No authorization token provided" },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const userId = (decoded as { id: string }).id;

        // Fetch user information
        const result = await userService.getUserById(userId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile retrieved successfully",
            data: result.user,
        });
    } catch (error) {
        logger.error("Error fetching user profile:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch profile",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
