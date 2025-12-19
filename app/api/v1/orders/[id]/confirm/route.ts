import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { OrderService } from "@/services/server/order.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAccessToken } from "@/utils/jwt.utils";
import crypto from "crypto";

// Schema for payment confirmation
const confirmOrderSchema = z.object({
    razorpayPaymentId: z.string().min(1, "Payment ID is required"),
    razorpayOrderId: z.string().min(1, "Order ID is required"),
    razorpaySignature: z.string().min(1, "Signature is required"),
});

export interface ConfirmOrderResponse {
    success: boolean;
    message: string;
    data?: {
        orderId: string;
        status: string;
        paymentStatus: string;
    };
    error?: Array<{ message?: string; path?: string[] }>;
}

const orderService = new OrderService();

export const POST = withLoggingAndErrorHandling(
    async (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => {
        const { id: orderId } = await context.params;

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
        const validated = confirmOrderSchema.safeParse(body);

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

        const { razorpayPaymentId, razorpayOrderId, razorpaySignature } =
            validated.data;

        try {
            // Verify the order exists and belongs to the user
            const order = await orderService.getOrderById(orderId);

            if (!order) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Order not found",
                    },
                    { status: HttpStatus.NOT_FOUND }
                );
            }

            // Verify order belongs to the authenticated user
            // Handle both populated (IUser object) and unpopulated (ObjectId) cases
            const orderUser = order.user as unknown;
            const orderUserId = typeof orderUser === 'object' && orderUser && typeof orderUser === 'object' && '_id' in orderUser
                ? (orderUser as { _id: { toString(): string } })._id.toString()
                : String(orderUser);

            if (orderUserId !== decoded.id) {
                console.error(`Authorization failed: Order user ${orderUserId} !== Authenticated user ${decoded.id}`);
                return NextResponse.json(
                    {
                        success: false,
                        message: "Unauthorized - Order does not belong to user",
                    },
                    { status: HttpStatus.FORBIDDEN }
                );
            }

            // Verify Razorpay signature
            const razorpaySecret = process.env.RAZORPAY_SECRET;
            if (!razorpaySecret) {
                console.error("RAZORPAY_SECRET not configured");
                return NextResponse.json(
                    {
                        success: false,
                        message: "Payment verification failed - Server configuration error",
                    },
                    { status: HttpStatus.INTERNAL_SERVER_ERROR }
                );
            }

            const generatedSignature = crypto
                .createHmac("sha256", razorpaySecret)
                .update(`${razorpayOrderId}|${razorpayPaymentId}`)
                .digest("hex");

            if (generatedSignature !== razorpaySignature) {
                console.error("Razorpay signature verification failed");
                return NextResponse.json(
                    {
                        success: false,
                        message: "Payment verification failed - Invalid signature",
                    },
                    { status: HttpStatus.BAD_REQUEST }
                );
            }

            // Confirm the order
            const confirmedOrder = await orderService.confirmOrder(orderId, {
                razorpayPaymentId,
                razorpayOrderId,
                razorpaySignature,
            });

            if (!confirmedOrder) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to confirm order",
                    },
                    { status: HttpStatus.INTERNAL_SERVER_ERROR }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    message: "Order confirmed successfully",
                    data: {
                        orderId: confirmedOrder._id.toString(),
                        status: confirmedOrder.status,
                        paymentStatus: confirmedOrder.paymentStatus,
                    },
                },
                { status: HttpStatus.OK }
            );
        } catch (error) {
            console.error("Error confirming order:", error);
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to confirm order",
                },
                { status: HttpStatus.INTERNAL_SERVER_ERROR }
            );
        }
    }
);
