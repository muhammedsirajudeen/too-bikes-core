import { HttpStatus } from "@/constants/status.constant";
import { UserModel } from "@/model/user.model";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { requirePermission } from "@/middleware/permission.middleware";
import { Permission } from "@/constants/permissions.constant";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/v1/admin/users
 * Fetch all users with pagination and search
 * Requires: Permission.USER_VIEW (Admin only - Staff does NOT have this)
 */
export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.USER_VIEW, async (request: NextRequest) => {
        // Get pagination params from query
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;
        
        // Get search query
        const searchQuery = searchParams.get('search')?.toLowerCase();

        try {
            // Build query
            let query = {};
            
            if (searchQuery) {
                query = {
                    $or: [
                        { name: { $regex: searchQuery, $options: 'i' } },
                        { email: { $regex: searchQuery, $options: 'i' } },
                        { phoneNumber: { $regex: searchQuery, $options: 'i' } },
                    ]
                };
            }

            // Fetch users with pagination
            const users = await UserModel.find(query)
                .select('-password') // Exclude password field
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean();

            // Get total count for pagination
            const total = await UserModel.countDocuments(query);
            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                success: true,
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            }, { status: HttpStatus.OK });
        } catch (error) {
            console.error("Error fetching users:", error);
            return NextResponse.json({
                success: false,
                message: "Failed to fetch users",
            }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
        }
    })
);

/**
 * PATCH /api/v1/admin/users/[id]
 * Update user (e.g., block/unblock)
 * Requires: Permission.USER_UPDATE (Admin only)
 */
export const PATCH = withLoggingAndErrorHandling(
    requirePermission(Permission.USER_UPDATE, async (request: NextRequest) => {
        try {
            const body = await request.json();
            const { userId, isBlocked } = body;

            if (!userId) {
                return NextResponse.json({
                    success: false,
                    message: "User ID is required",
                }, { status: HttpStatus.BAD_REQUEST });
            }

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { isBlocked },
                { new: true }
            ).select('-password');

            if (!user) {
                return NextResponse.json({
                    success: false,
                    message: "User not found",
                }, { status: HttpStatus.NOT_FOUND });
            }

            return NextResponse.json({
                success: true,
                data: user,
                message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            }, { status: HttpStatus.OK });
        } catch (error) {
            console.error("Error updating user:", error);
            return NextResponse.json({
                success: false,
                message: "Failed to update user",
            }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
        }
    })
);
