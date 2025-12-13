import { HttpStatus } from "@/constants/status.constant";
import { StoreRepository } from "@/repository/store.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const storeRepo = new StoreRepository();

// Schema for nearest store query
const nearestStoreSchema = z.object({
    latitude: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
    longitude: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
});

/**
 * GET /api/v1/stores
 * Returns all stores
 */
export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // Check if this is a nearest store query
    if (searchParams.has('latitude') && searchParams.has('longitude')) {
        const params = {
            latitude: searchParams.get('latitude'),
            longitude: searchParams.get('longitude'),
        };

        const validated = nearestStoreSchema.safeParse(params);

        if (!validated.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid coordinates",
                error: validated.error.issues
            }, { status: HttpStatus.BAD_REQUEST });
        }

        const nearestStore = await storeRepo.findNearestStore(
            validated.data.longitude,
            validated.data.latitude
        );

        if (!nearestStore) {
            return NextResponse.json({
                success: false,
                message: "No stores found",
                data: null
            }, { status: HttpStatus.NOT_FOUND });
        }

        return NextResponse.json({
            success: true,
            message: "Nearest store retrieved successfully",
            data: nearestStore
        }, { status: HttpStatus.OK });
    }

    // Otherwise, return all stores
    const stores = await storeRepo.findAllStores();

    return NextResponse.json({
        success: true,
        message: "Stores retrieved successfully",
        data: stores
    }, { status: HttpStatus.OK });
});
