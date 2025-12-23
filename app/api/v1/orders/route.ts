import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { Order2Service } from "@/services/server/order2.service";
import { VehicleRepository } from "@/repository/vehicle.repository";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { Types } from "mongoose";

// Schema for order creation
const createOrderSchema = z.object({
    vehicleId: z.string().min(1, "Vehicle ID is required"),
    startTime: z.string().datetime("Invalid start time format"),
    endTime: z.string().datetime("Invalid end time format"),
    totalAmount: z.number().positive("Total amount must be positive"),
});

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    data?: {
        orderId: string;
        razorpayOrderId: string;
    };
    error?: Array<{ message?: string; path?: string[] }>;
}

const order2Service = new Order2Service();
const vehicleRepository = new VehicleRepository();

export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
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

    // Parse and validate request body
    const body = await request.json();
    const validated = createOrderSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid request",
                error: validated.error.issues,
            },
            { status: HttpStatus.BAD_REQUEST }
        );
    }

    const { vehicleId, startTime, endTime, totalAmount } = validated.data;

    // Fetch vehicle to get store ID
    // Note: order2Service requires storeId.
    const vehicle = await vehicleRepository.findById(new Types.ObjectId(vehicleId));

    if (!vehicle) {
        return NextResponse.json(
            {
                success: false,
                message: "Vehicle not found",
            },
            { status: HttpStatus.NOT_FOUND }
        );
    }

    // Ensure vehicle has a store
    if (!vehicle.store) {
        return NextResponse.json(
            {
                success: false,
                message: "Vehicle does not have an associated store",
            },
            { status: HttpStatus.BAD_REQUEST }
        );
    }

    // Attempt booking using the new robust service
    try {
        const bookingResult = await order2Service.attemptBooking(
            vehicleId,
            new Date(startTime),
            new Date(endTime),
            decoded.id,
            totalAmount,
            vehicle.store.toString()
        );

        return NextResponse.json(
            {
                success: true,
                message: "Order created successfully",
                data: {
                    orderId: bookingResult.orderId.toString(),
                    razorpayOrderId: bookingResult.razorpayOrderId,
                    // Additional data available if needed: reservationId, etc.
                },
            },
            { status: HttpStatus.CREATED }
        );
    } catch (error: unknown) {
        console.error("Error creating order:", error);

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Failed to create order";

        if (error instanceof Error) {
            if (error.message === 'Vehicle not available in this time slot') {
                statusCode = HttpStatus.CONFLICT;
                message = error.message;
            } else if (
                error.message === 'Booking failed after multiple retries due to high contention'
            ) {
                statusCode = HttpStatus.SERVICE_UNAVAILABLE;
                message = "High demand for this vehicle. Please try again.";
            }
        }

        return NextResponse.json(
            { success: false, message },
            { status: statusCode }
        );
    }

});
