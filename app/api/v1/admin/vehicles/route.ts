import { HttpStatus } from "@/constants/status.constant";
import { VehicleRepository } from "@/repository/vehicle.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSignedUrl } from "@/utils/s3Storage.utils";

const vehicleRepo = new VehicleRepository();

// Schema for creating a vehicle
const createVehicleSchema = z.object({
    store: z.string().min(1, "Store ID is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    brand: z.string().min(1, "Brand is required"),
    modelYear: z.number().optional(),
    fuelType: z.enum(["petrol", "diesel", "electric"]),
    pricePerHour: z.number().min(0, "Price per hour must be positive"),
    pricePerDay: z.number().optional(),
    mileage: z.number().optional(),
    licensePlate: z.string().min(1, "License plate is required"),
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
 * GET /api/v1/admin/vehicles
 * Get all vehicles (for admin)
 */
export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuth(request);
    if (!authCheck.valid) {
        return NextResponse.json({
            success: false,
            message: authCheck.message
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    const vehicles = await vehicleRepo.findAll({});

    // Generate signed URLs for images
    const vehiclesWithUrls = await Promise.all(vehicles.map(async (vehicle) => {
        const vehicleObj = vehicle.toObject ? vehicle.toObject() : vehicle;
        const images = await Promise.all((vehicleObj.image || []).map(async (key: string) => {
            try {
                const url = await generateSignedUrl(key);
                return { key, url };
            } catch (error) {
                console.error(`Failed to sign URL for key ${key}:`, error);
                return { key, url: null };
            }
        }));
        return { ...vehicleObj, image: images };
    }));

    return NextResponse.json({
        success: true,
        message: "Vehicles retrieved successfully",
        data: vehiclesWithUrls
    }, { status: HttpStatus.OK });
});

/**
 * POST /api/v1/admin/vehicles
 * Create a new vehicle
 */
export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuth(request);
    if (!authCheck.valid) {
        return NextResponse.json({
            success: false,
            message: authCheck.message
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    const body = await request.json();
    const validated = createVehicleSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid vehicle data",
            error: validated.error.issues
        }, { status: HttpStatus.BAD_REQUEST });
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vehicleData: any = {
            ...validated.data,
            isActive: validated.data.isActive ?? true
        };

        const newVehicle = await vehicleRepo.create(vehicleData);

        return NextResponse.json({
            success: true,
            message: "Vehicle created successfully",
            data: newVehicle
        }, { status: HttpStatus.CREATED });
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
