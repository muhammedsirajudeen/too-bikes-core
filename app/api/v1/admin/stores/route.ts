import { HttpStatus } from "@/constants/status.constant";
import { StoreRepository } from "@/repository/store.repository";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { verifyAdminAuthFromRequest } from "@/utils/admin-auth.utils";
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
 * GET /api/v1/admin/stores
 * Get all stores (for admin)
 */
export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuthFromRequest(request);
    if (!authCheck.valid) {
        return NextResponse.json({
            success: false,
            message: authCheck.message
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    // Get pagination and filter params from query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // Get filter params
    const districtFilter = searchParams.get('district');
    const searchQuery = searchParams.get('search')?.toLowerCase();

    let allStores = await storeRepo.findAll({});

    // Apply district filter
    if (districtFilter && districtFilter !== 'all') {
        allStores = allStores.filter(store => store.district === districtFilter);
    }

    // Apply search filter
    if (searchQuery) {
        allStores = allStores.filter(store => {
            const storeName = store.name?.toLowerCase() || "";
            const storeAddress = store.address?.toLowerCase() || "";
            const storeDistrict = store.district?.toLowerCase() || "";
            const storeContact = store.contactNumber?.toLowerCase() || "";

            return storeName.includes(searchQuery) ||
                   storeAddress.includes(searchQuery) ||
                   storeDistrict.includes(searchQuery) ||
                   storeContact.includes(searchQuery);
        });
    }

    // Get total count after filtering
    const total = allStores.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedStores = allStores.slice(skip, skip + limit);

    return NextResponse.json({
        success: true,
        message: "Stores retrieved successfully",
        data: paginatedStores,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    }, { status: HttpStatus.OK });
});


/**
 * POST /api/v1/admin/stores
 * Create a new store
 */
export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Verify admin authentication
    const authCheck = verifyAdminAuthFromRequest(request);
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
