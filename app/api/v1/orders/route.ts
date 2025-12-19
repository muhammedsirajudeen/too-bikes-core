import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { OrderService } from "@/services/server/order.service";
import { VehicleRepository } from "@/repository/vehicle.repository";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import { verifyAccessToken } from "@/utils/jwt.utils";
import Razorpay from "razorpay";

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

const orderService = new OrderService();
const vehicleRepository = new VehicleRepository();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
    key_secret: process.env.RAZORPAY_SECRET!,
});

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

    // Create order
    try {
        // Create Razorpay order first
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // Convert to paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${decoded.id.substring(0, 8)}`, // Max 40 chars
            notes: {
                userId: decoded.id,
                vehicleId: vehicleId,
            },
        });

        // Create order in database with Razorpay order ID
        const order = await orderService.createOrder({
            userId: new Types.ObjectId(decoded.id),
            vehicleId: new Types.ObjectId(vehicleId),
            storeId: vehicle.store as Types.ObjectId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            totalAmount,
            razorpayOrderId: razorpayOrder.id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Order created successfully",
                data: {
                    orderId: order._id.toString(),
                    razorpayOrderId: razorpayOrder.id,
                },
            },
            { status: HttpStatus.CREATED }
        );
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create order",
            },
            { status: HttpStatus.INTERNAL_SERVER_ERROR }
        );
    }
});
