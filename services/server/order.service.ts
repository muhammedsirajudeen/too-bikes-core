import { OrderRepository } from "@/repository/order.repository";
import { IOrder } from "@/core/interface/model/IOrder.model";
import { Types } from "mongoose";

export class OrderService {
    private orderRepository: OrderRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
    }

    /**
     * Create a new order
     */
    async createOrder(orderData: {
        userId: Types.ObjectId;
        vehicleId: Types.ObjectId;
        storeId: Types.ObjectId;
        startTime: Date;
        endTime: Date;
        totalAmount: number;
        razorpayOrderId?: string;
    }): Promise<IOrder> {
        const order = await this.orderRepository.create({
            user: orderData.userId,
            vehicle: orderData.vehicleId,
            store: orderData.storeId,
            startTime: orderData.startTime,
            endTime: orderData.endTime,
            totalAmount: orderData.totalAmount,
            razorpayOrderId: orderData.razorpayOrderId,
            status: "pending",
            paymentStatus: "pending",
        });

        return order;
    }

    /**
     * Get order by ID with populated references
     */
    async getOrderById(orderId: string): Promise<IOrder | null> {
        return this.orderRepository.findByIdWithPopulate(orderId);
    }

    /**
     * Get orders by user ID
     */
    async getOrdersByUserId(userId: Types.ObjectId): Promise<IOrder[]> {
        return this.orderRepository.findByUserIdWithPopulate(userId);
    }

    /**
     * Get orders by user ID with pagination
     */
    async getOrdersByUserIdPaginated(
        userId: Types.ObjectId,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        orders: IOrder[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }> {
        return this.orderRepository.findByUserIdWithPagination(userId, page, limit);
    }

    /**
     * Update order status
     */
    async updateOrderStatus(
        orderId: string,
        status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled"
    ): Promise<IOrder | null> {
        const order = await this.orderRepository.update(orderId, { status });
        return order;
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(
        orderId: string,
        paymentStatus: "pending" | "paid" | "refunded"
    ): Promise<IOrder | null> {
        const order = await this.orderRepository.update(orderId, { paymentStatus });
        return order;
    }

    /**
     * Confirm payment for order (does NOT confirm the order itself)
     * Order status is set to 'pending' and awaits admin license review
     */
    async confirmOrder(
        orderId: string,
        paymentData: {
            razorpayPaymentId: string;
            razorpayOrderId: string;
            razorpaySignature?: string;
        }
    ): Promise<IOrder | null> {
        // Payment is confirmed, but order awaits admin license review
        const order = await this.orderRepository.update(orderId, {
            status: "pending", // Changed from 'confirmed' - admin must review license
            paymentStatus: "paid",
            razorpayPaymentId: paymentData.razorpayPaymentId,
            razorpaySignature: paymentData.razorpaySignature,
        });
        return order;
    }
}
