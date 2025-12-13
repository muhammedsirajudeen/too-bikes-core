import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { OrderService } from "@/services/server/order.service";
import { NextRequest, NextResponse } from "next/server";
import { IVehicle } from "@/core/interface/model/IVehicle.model";
import { IStore } from "@/core/interface/model/IStore.model";
import IUser from "@/core/interface/model/IUser.model";

export interface GetOrderResponse {
    success: boolean;
    message: string;
    data?: {
        order: {
            _id: string;
            status: string;
            paymentStatus: string;
            totalAmount: number;
            startTime: string;
            endTime: string;
            createdAt?: string;
            vehicle: {
                _id: string;
                name: string;
                brand: string;
                image?: string[];
                fuelType: string;
                pricePerDay: number;
                pricePerHour: number;
            };
            store: {
                _id: string;
                name: string;
                address: string;
                contactNumber?: string;
                openingTime: string;
                closingTime: string;
            };
            user: {
                _id: string;
                name?: string;
                phoneNumber: string;
                email?: string;
            };
        };
    };
    error?: string;
}

const orderService = new OrderService();

export const GET = withLoggingAndErrorHandling(
    async (
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) => {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order ID is required",
                },
                { status: HttpStatus.BAD_REQUEST }
            );
        }

        try {
            const order = await orderService.getOrderById(id);

            if (!order) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Order not found",
                    },
                    { status: HttpStatus.NOT_FOUND }
                );
            }

            // Type assertions for populated fields
            const vehicle = order.vehicle as IVehicle;
            const store = order.store as IStore;
            const user = order.user as IUser;

            return NextResponse.json(
                {
                    success: true,
                    message: "Order retrieved successfully",
                    data: {
                        order: {
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
                                contactNumber: store.contactNumber,
                                openingTime: store.openingTime,
                                closingTime: store.closingTime,
                            },
                            user: {
                                _id: user._id.toString(),
                                name: user.name,
                                phoneNumber: user.phoneNumber,
                                email: user.email,
                            },
                        },
                    },
                },
                { status: HttpStatus.OK }
            );
        } catch (error) {
            console.error("Error fetching order:", error);
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to fetch order",
                    error: error instanceof Error ? error.message : "Unknown error",
                },
                { status: HttpStatus.INTERNAL_SERVER_ERROR }
            );
        }
    }
);
