import { HttpStatus } from "@/constants/status.constant";
import { OrderRepository } from "@/repository/order.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAdminAuthFromRequest } from "@/utils/admin-auth.utils";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

const orderRepository = new OrderRepository();

const reviewOrderSchema = z.object({
    action: z.enum(["confirm", "reject"]),
    reason: z.string().optional(),
});

export const PATCH = withLoggingAndErrorHandling(async (
    request: NextRequest,
    { params }: { params: { orderId: string } }
) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuthFromRequest(request);
    if (!authCheck.valid) {
        return NextResponse.json(
            { success: false, message: authCheck.message },
            { status: HttpStatus.UNAUTHORIZED }
        );
    }

    const body = await request.json();
    const validated = reviewOrderSchema.safeParse(body);

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

    const { orderId } = params;
    const { action, reason } = validated.data;

    try {
        // Fetch the order
        const order = await orderRepository.findById(new Types.ObjectId(orderId));

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: HttpStatus.NOT_FOUND }
            );
        }

        // Validate that order is in correct state (pending + paid)
        if (order.status !== "pending" || order.paymentStatus !== "paid") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order cannot be reviewed in current state",
                },
                { status: HttpStatus.BAD_REQUEST }
            );
        }

        // Update order based on action
        let updateData: any = {};
        
        if (action === "confirm") {
            updateData = { status: "confirmed" };
        } else {
            updateData = {
                status: "cancelled",
                cancellationReason: reason || "License verification failed",
            };
        }

        const updatedOrder = await orderRepository.update(orderId, updateData);

        return NextResponse.json({
            success: true,
            message: `Order ${action === "confirm" ? "confirmed" : "rejected"} successfully`,
            data: updatedOrder,
        }, { status: HttpStatus.OK });
    } catch (error) {
        console.error("Error reviewing order:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to review order",
        }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
});
