import { HttpStatus } from "@/constants/status.constant";
import { VehicleRepository } from "@/repository/vehicle.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";

const vehicleRepo = new VehicleRepository();

// Schema for updating a vehicle
const updateVehicleSchema = z.object({
    store: z.string().optional(),
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    brand: z.string().min(1, "Brand is required").optional(),
    modelYear: z.number().optional(),
    fuelType: z.enum(["petrol", "diesel", "electric"]).optional(),
    pricePerHour: z.number().min(0).optional(),
    pricePerDay: z.number().optional(),
    mileage: z.number().optional(),
    licensePlate: z.string().min(1).optional(),
    image: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
});

/**
 * Verify admin token from Authorization header
 */
function verifyAdminAuth(request: NextRequest): { valid: boolean; message?: string } {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, message: "No authorization token provided" };
    }

    const token = authHeader.split(' ')[1];

    try {
        // Decode JWT to verify it's an admin token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);

        if (payload.role !== 'admin') {
            return { valid: false, message: "Unauthorized: Admin access required" };
        }

        return { valid: true };
    } catch {
        return { valid: false, message: "Invalid token" };
    }
}

/**
 * PUT /api/v1/admin/vehicles/[id]
 * Update an existing vehicle
 */
export const PUT = withLoggingAndErrorHandling(async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuth(request);
    if (!authCheck.valid) {
        return NextResponse.json({
            success: false,
            message: authCheck.message
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    const { id } = await context.params;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
        return NextResponse.json({
            success: false,
            message: "Invalid vehicle ID"
        }, { status: HttpStatus.BAD_REQUEST });
    }

    const body = await request.json();
    const validated = updateVehicleSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid vehicle data",
            error: validated.error.issues
        }, { status: HttpStatus.BAD_REQUEST });
    }

    try {
        const updatedVehicle = await vehicleRepo.update(id, validated.data);

        if (!updatedVehicle) {
            return NextResponse.json({
                success: false,
                message: "Vehicle not found"
            }, { status: HttpStatus.NOT_FOUND });
        }

        return NextResponse.json({
            success: true,
            message: "Vehicle updated successfully",
            data: updatedVehicle
        }, { status: HttpStatus.OK });
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000) {
             return NextResponse.json({
                success: false,
                message: "License plate must be unique",
            }, { status: HttpStatus.CONFLICT });
        }
        throw error;
    }
});

/**
 * DELETE /api/v1/admin/vehicles/[id]
 * Delete a vehicle
 */
export const DELETE = withLoggingAndErrorHandling(async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuth(request);
    if (!authCheck.valid) {
        return NextResponse.json({
            success: false,
            message: authCheck.message
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    const { id } = await context.params;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
        return NextResponse.json({
            success: false,
            message: "Invalid vehicle ID"
        }, { status: HttpStatus.BAD_REQUEST });
    }

    await vehicleRepo.deleteOne({ _id: new Types.ObjectId(id) });

    return NextResponse.json({
        success: true,
        message: "Vehicle deleted successfully"
    }, { status: HttpStatus.OK });
});
