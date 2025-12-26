import { HttpStatus } from "@/constants/status.constant";
import { OrderRepository } from "@/repository/order.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { requirePermission } from "@/middleware/permission.middleware";
import { Permission } from "@/constants/permissions.constant";
import { NextRequest, NextResponse } from "next/server";
import IUser from "@/core/interface/model/IUser.model";
import { IVehicle } from "@/core/interface/model/IVehicle.model";

// Import models to ensure they're registered with Mongoose
import "@/model/user.model";
import "@/model/vehicles.model";
import "@/model/store.model";

const orderRepository = new OrderRepository();

export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.ORDER_VIEW, async (request: NextRequest) => {


    // Get pagination and filter params from query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // Get filter params
    const statusFilter = searchParams.get('status');
    const paymentFilter = searchParams.get('paymentStatus');
    const searchQuery = searchParams.get('search')?.toLowerCase();

    try {
        // Fetch all orders with populated user, vehicle, and store data
        const allOrders = await orderRepository.findAllWithPopulate();
        
        // Exclude pending + paid orders (those are in verification page)
        let filteredOrders = allOrders.filter(
            (order) => !(order.status === "pending" && order.paymentStatus === "paid")
        );

        // Apply status filter
        if (statusFilter) {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }

        // Apply payment filter
        if (paymentFilter) {
            filteredOrders = filteredOrders.filter(order => order.paymentStatus === paymentFilter);
        }

        // Apply search filter
        if (searchQuery) {
            filteredOrders = filteredOrders.filter(order => {
                const user = order.user as IUser;
                const vehicle = order.vehicle as IVehicle;
                
                const userName = user?.name?.toLowerCase() || "";
                const userPhone = user?.phoneNumber?.toLowerCase() || "";
                const vehicleName = `${vehicle?.brand || ""} ${vehicle?.name || ""}`.toLowerCase();
                const orderId = order._id.toString().toLowerCase();

                return userName.includes(searchQuery) ||
                       userPhone.includes(searchQuery) ||
                       vehicleName.includes(searchQuery) ||
                       orderId.includes(searchQuery);
            });
        }

       // Get total count after filtering
        const total = filteredOrders.length;
        const totalPages = Math.ceil(total / limit);

        // Apply pagination
        const paginatedOrders = filteredOrders.slice(skip, skip + limit);

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
        console.error("Error fetching orders:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch orders",
        }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
}));

