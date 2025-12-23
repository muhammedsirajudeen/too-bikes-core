import { HttpStatus } from "@/constants/status.constant";
import { StoreRepository } from "@/repository/store.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const storeRepo = new StoreRepository();

// Schema for location-based store sorting
const locationSchema = z.object({
    latitude: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
    longitude: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
});

/**
 * GET /api/v1/stores
 * Returns all stores, optionally sorted by distance from given coordinates
 */
export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // Check if this is a location-based sorting query
    if (searchParams.has('latitude') && searchParams.has('longitude')) {
        const params = {
            latitude: searchParams.get('latitude'),
            longitude: searchParams.get('longitude'),
        };

        const validated = locationSchema.safeParse(params);

        if (!validated.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid coordinates",
                error: validated.error.issues
            }, { status: HttpStatus.BAD_REQUEST });
        }

        // Get all stores sorted by distance from the provided coordinates
        const stores = await storeRepo.findAllStoresSortedByDistance(
            validated.data.longitude,
            validated.data.latitude
        );

        return NextResponse.json({
            success: true,
            message: "Stores retrieved successfully (sorted by distance)",
            data: stores
        }, { status: HttpStatus.OK });
    }

    // Otherwise, return all stores unsorted
    const stores = await storeRepo.findAllStores();

    return NextResponse.json({
        success: true,
        message: "Stores retrieved successfully",
        data: stores
    }, { status: HttpStatus.OK });
});
