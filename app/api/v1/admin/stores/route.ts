import { HttpStatus } from "@/constants/status.constant";
import { StoreRepository } from "@/repository/store.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const storeRepo = new StoreRepository();

// Schema for creating a store
const createStoreSchema = z.object({
    name: z.string().min(1, "Store name is required").trim(),
    description: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    district: z.string().min(1, "District is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    openingTime: z.string().min(1, "Opening time is required"),
    closingTime: z.string().min(1, "Closing time is required"),
    contactNumber: z.string().optional(),
    images: z.array(z.string()).optional(),
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
 * POST /api/v1/admin/stores
 * Create a new store
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
    const validated = createStoreSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid store data",
            error: validated.error.issues
        }, { status: HttpStatus.BAD_REQUEST });
    }

    const { latitude, longitude, ...storeData } = validated.data;

    // Create store with GeoJSON location format
    const newStore = await storeRepo.create({
        ...storeData,
        latitude,
        longitude,
        location: {
            coordinates: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        }
    });

    return NextResponse.json({
        success: true,
        message: "Store created successfully",
        data: newStore
    }, { status: HttpStatus.CREATED });
});
