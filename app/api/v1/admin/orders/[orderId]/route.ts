import { HttpStatus } from "@/constants/status.constant";
import { OrderRepository } from "@/repository/order.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { requirePermission } from "@/middleware/permission.middleware";
import { Permission } from "@/constants/permissions.constant";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { IOrder } from "@/core/interface/model/IOrder.model";

import "@/model/user.model";
import "@/model/vehicles.model";
import "@/model/store.model";

const orderRepository = new OrderRepository();

const reviewOrderSchema = z.object({
    action: z.enum(["confirm", "reject"]),
    reason: z.string().optional(),
});

export const PATCH = withLoggingAndErrorHandling(async (
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) => {
    // Check permission first
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json(
            { success: false, message: "No authorization token" },
            { status: HttpStatus.UNAUTHORIZED }
        );
    }

    // Decode token to check permission
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        // Check if has ORDER_UPDATE permission
        const { getPermissionsForRole, Permission } = await import("@/constants/permissions.constant");
        const permissions = getPermissionsForRole(payload.role);
        if (!permissions.includes(Permission.ORDER_UPDATE)) {
            return NextResponse.json(
                { success: false, message: "Insufficient permissions" },
                { status: HttpStatus.FORBIDDEN }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Invalid token" },
            { status: HttpStatus.UNAUTHORIZED }
        );
    }

    // Await params in Next.js 15
    const { orderId } = await context.params;


        const body = await request.json();
        const validated = reviewOrderSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request data",
                    error: validated.error.issues,
                },
                { status: HttpStatus.BAD_REQUEST }
            );
        }

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
            let updateData: Partial<Pick<IOrder, 'status' | 'rejectionReason'>> = {};
            
            if (action === "confirm") {
                updateData = { status: "confirmed" };
            } else {
                updateData = {
                    status: "rejected",
                    rejectionReason: reason || "License verification failed",
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
    }
);
