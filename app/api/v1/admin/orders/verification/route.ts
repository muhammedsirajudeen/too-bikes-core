import { HttpStatus } from "@/constants/status.constant";
import { OrderRepository } from "@/repository/order.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAdminAuthFromRequest } from "@/utils/admin-auth.utils";
import { NextRequest, NextResponse } from "next/server";

const orderRepository = new OrderRepository();

export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuthFromRequest(request);
    if (!authCheck.valid) {
        return NextResponse.json(
            { success: false, message: authCheck.message },
            { status: HttpStatus.UNAUTHORIZED }
        );
    }

    // Get pagination params from query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    try {
        // Fetch all orders with populated user, vehicle, and store data
        const allOrders = await orderRepository.findAllWithPopulate();
        
        // Filter only pending + paid orders (for verification)
        const pendingVerificationOrders = allOrders.filter(
            (order) => order.status === "pending" && order.paymentStatus === "paid"
        );

        // Get total count
        const total = pendingVerificationOrders.length;
        const totalPages = Math.ceil(total / limit);

        // Apply pagination
        const paginatedOrders = pendingVerificationOrders.slice(skip, skip + limit);

        return NextResponse.json({
            success: true,
            data: paginatedOrders,
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
        console.error("Error fetching verification orders:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch verification orders",
        }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
});
