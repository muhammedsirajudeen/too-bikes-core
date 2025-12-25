import { HttpStatus } from "@/constants/status.constant";
import { StoreRepository } from "@/repository/store.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAdminAuthFromRequest } from "@/utils/admin-auth.utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";

const storeRepo = new StoreRepository();

// Schema for updating a store
const updateStoreSchema = z.object({
    name: z.string().min(1, "Store name is required").trim().optional(),
    description: z.string().optional(),
    address: z.string().min(1, "Address is required").optional(),
    district: z.string().min(1, "District is required").optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    openingTime: z.string().min(1, "Opening time is required").optional(),
    closingTime: z.string().min(1, "Closing time is required").optional(),
    contactNumber: z.string().optional(),
    images: z.array(z.string()).optional(),
});

/**
 * PUT /api/v1/admin/stores/[id]
 * Update an existing store
 */
export const PUT = withLoggingAndErrorHandling(async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuthFromRequest(request);
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
            message: "Invalid store ID"
        }, { status: HttpStatus.BAD_REQUEST });
    }

    const body = await request.json();
    const validated = updateStoreSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid store data",
            error: validated.error.issues
        }, { status: HttpStatus.BAD_REQUEST });
    }

    const updateData: Record<string, unknown> = { ...validated.data };

    // If latitude or longitude is provided, update the GeoJSON location
    if (validated.data.latitude !== undefined || validated.data.longitude !== undefined) {
        // Get existing store to merge coordinates
        const existingStore = await storeRepo.findById(new Types.ObjectId(id));

        if (!existingStore) {
            return NextResponse.json({
                success: false,
                message: "Store not found"
            }, { status: HttpStatus.NOT_FOUND });
        }

        const lat = validated.data.latitude ?? existingStore.latitude;
        const lng = validated.data.longitude ?? existingStore.longitude;

        updateData.latitude = lat;
        updateData.longitude = lng;
        updateData.location = {
            coordinates: {
                type: "Point",
                coordinates: [lng, lat]
            }
        };
    }

    const updatedStore = await storeRepo.update(id, updateData);

    if (!updatedStore) {
        return NextResponse.json({
            success: false,
            message: "Store not found"
        }, { status: HttpStatus.NOT_FOUND });
    }

    return NextResponse.json({
        success: true,
        message: "Store updated successfully",
        data: updatedStore
    }, { status: HttpStatus.OK });
});

/**
 * DELETE /api/v1/admin/stores/[id]
 * Delete a store
 */
export const DELETE = withLoggingAndErrorHandling(async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuthFromRequest(request);
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
            message: "Invalid store ID"
        }, { status: HttpStatus.BAD_REQUEST });
    }

    await storeRepo.deleteOne({ _id: new Types.ObjectId(id) });

    return NextResponse.json({
        success: true,
        message: "Store deleted successfully"
    }, { status: HttpStatus.OK });
});
