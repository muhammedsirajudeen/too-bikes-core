import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { OrderService } from "@/services/server/order.service";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { Types } from "mongoose";
import { IVehicle } from "@/core/interface/model/IVehicle.model";
import { IStore } from "@/core/interface/model/IStore.model";

const orderService = new OrderService();

export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized - No token provided",
            },
            { status: HttpStatus.UNAUTHORIZED }
        );
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded || typeof decoded === "string" || !decoded.id) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized - Invalid token",
            },
            { status: HttpStatus.UNAUTHORIZED }
        );
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid pagination parameters",
            },
            { status: HttpStatus.BAD_REQUEST }
        );
    }

    try {
        const result = await orderService.getOrdersByUserIdPaginated(
            new Types.ObjectId(decoded.id),
            page,
            limit
        );

        // Format orders for response
        const formattedOrders = result.orders.map((order) => {
            const vehicle = order.vehicle as IVehicle;
            const store = order.store as IStore;

            return {
                _id: order._id.toString(),
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount,
                startTime: order.startTime.toISOString(),
                endTime: order.endTime.toISOString(),
                createdAt: order.createdAt?.toISOString(),
                vehicle: {
                    _id: vehicle._id.toString(),
                    name: vehicle.name,
                    brand: vehicle.brand,
                    image: vehicle.image,
                    fuelType: vehicle.fuelType,
                    pricePerDay: vehicle.pricePerDay,
                    pricePerHour: vehicle.pricePerHour,
                },
                store: {
                    _id: store._id.toString(),
                    name: store.name,
                    address: store.address,
                },
            };
        });

        return NextResponse.json(
            {
                success: true,
                message: "Orders retrieved successfully",
                data: {
                    orders: formattedOrders,
                    pagination: result.pagination,
                },
            },
            { status: HttpStatus.OK }
        );
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch orders",
            },
            { status: HttpStatus.INTERNAL_SERVER_ERROR }
        );
    }
});
