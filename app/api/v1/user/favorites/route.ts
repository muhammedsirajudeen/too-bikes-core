import { HttpStatus } from "@/constants/status.constant";
import { UserFavoriteRepository } from "@/repository/user.favorite.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { NextRequest, NextResponse } from "next/server";
import { Document, Types } from "mongoose";

const userFavoriteRepository = new UserFavoriteRepository();

interface IUserFavorite extends Document {
    userId: Types.ObjectId;
    vehicleId: Types.ObjectId;
}

export interface GetFavoritesResponse {
    success: boolean;
    message: string;
    data?: {
        favorites: IUserFavorite[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
    error?: string;
}

/**
 * GET /api/v1/user/favorites
 * Get all favorite vehicles for the authenticated user with pagination
 */
export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
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

        // Get pagination parameters from query
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json({
                success: false,
                message: "Invalid pagination parameters",
            }, { status: HttpStatus.BAD_REQUEST });
        }

        // Get total count
        const totalCount = await userFavoriteRepository.countUserFavorites(userId);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;

        // Get paginated favorites
        const favorites = await userFavoriteRepository.getUserFavoritesPaginated(
            userId,
            skip,
            limit
        );

        return NextResponse.json({
            success: true,
            message: "Favorites retrieved successfully",
            data: {
                favorites,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                }
            }
        }, { status: HttpStatus.OK });

    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch favorites",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
});
