import { HttpStatus } from "@/constants/status.constant";
import { UserFavoriteRepository } from "@/repository/user.favorite.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { NextRequest, NextResponse } from "next/server";

const userFavoriteRepository = new UserFavoriteRepository();

export interface FavoriteActionResponse {
    success: boolean;
    message: string;
    data?: {
        isFavorite: boolean;
    };
    error?: string;
}

/**
 * POST /api/v1/user/favorites/[vehicleId]
 * Add a vehicle to user's favorites
 */
export const POST = withLoggingAndErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ vehicleId: string }> }) => {
        const { vehicleId } = await params;

        // Extract and verify token
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                success: false,
                message: "No authorization token provided",
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyAccessToken(token);

            if (!decoded || typeof decoded === 'string') {
                return NextResponse.json({
                    success: false,
                    message: "Invalid or expired token",
                }, { status: HttpStatus.UNAUTHORIZED });
            }

            const userId = decoded.id;

            // Add to favorites
            await userFavoriteRepository.addFavorite(userId, vehicleId);

            return NextResponse.json({
                success: true,
                message: "Vehicle added to favorites",
                data: {
                    isFavorite: true
                }
            }, { status: HttpStatus.OK });

        } catch (error) {
            console.error("Error adding to favorites:", error);
            return NextResponse.json({
                success: false,
                message: "Failed to add vehicle to favorites",
                error: error instanceof Error ? error.message : "Unknown error",
            }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
        }
    }
);

/**
 * DELETE /api/v1/user/favorites/[vehicleId]
 * Remove a vehicle from user's favorites
 */
export const DELETE = withLoggingAndErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ vehicleId: string }> }) => {
        const { vehicleId } = await params;

        // Extract and verify token
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                success: false,
                message: "No authorization token provided",
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyAccessToken(token);

            if (!decoded || typeof decoded === 'string') {
                return NextResponse.json({
                    success: false,
                    message: "Invalid or expired token",
                }, { status: HttpStatus.UNAUTHORIZED });
            }

            const userId = decoded.id;

            // Remove from favorites
            await userFavoriteRepository.removeFavorite(userId, vehicleId);

            return NextResponse.json({
                success: true,
                message: "Vehicle removed from favorites",
                data: {
                    isFavorite: false
                }
            }, { status: HttpStatus.OK });

        } catch (error) {
            console.error("Error removing from favorites:", error);
            return NextResponse.json({
                success: false,
                message: "Failed to remove vehicle from favorites",
                error: error instanceof Error ? error.message : "Unknown error",
            }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
        }
    }
);

/**
 * GET /api/v1/user/favorites/[vehicleId]
 * Check if a vehicle is in user's favorites
 */
export const GET = withLoggingAndErrorHandling(
    async (request: NextRequest, { params }: { params: Promise<{ vehicleId: string }> }) => {
        const { vehicleId } = await params;

        // Extract and verify token
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                success: false,
                message: "No authorization token provided",
            }, { status: HttpStatus.UNAUTHORIZED });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyAccessToken(token);

            if (!decoded || typeof decoded === 'string') {
                return NextResponse.json({
                    success: false,
                    message: "Invalid or expired token",
                }, { status: HttpStatus.UNAUTHORIZED });
            }

            const userId = decoded.id;

            // Check if favorited
            const isFavorite = await userFavoriteRepository.isFavorite(userId, vehicleId);

            return NextResponse.json({
                success: true,
                message: "Favorite status retrieved",
                data: {
                    isFavorite
                }
            }, { status: HttpStatus.OK });

        } catch (error) {
            console.error("Error checking favorite status:", error);
            return NextResponse.json({
                success: false,
                message: "Failed to check favorite status",
                error: error instanceof Error ? error.message : "Unknown error",
            }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
        }
    }
);
