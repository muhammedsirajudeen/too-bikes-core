import { HttpStatus } from "@/constants/status.constant";
import { IVehicle } from "@/core/interface/model/IVehicle.model";
import { IStore } from "@/core/interface/model/IStore.model";
import { querySchema } from "@/lib/schemas/availableVehicles.schema";
import { AvailableVehiclesService } from "@/services/server/available-vehicles.service";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { generateSignedUrl } from "@/utils/s3Storage.utils";

export interface VehicleResponse {
  success: boolean;
  message: string;
  data: IVehicle[];
  metadata: {
    district: string;
    store?: IStore | null;
    stores: IStore[]; // All stores sorted by distance
    pagination: Pagination;
  };
  error?: Array<{ message?: string; path?: string[] }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}



const availableVehiclesService = new AvailableVehiclesService();

export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const validated = querySchema.safeParse(params);
  if (!validated.success) {
    return NextResponse.json({
      success: false,
      error: validated.error.issues
    }, { status: HttpStatus.BAD_REQUEST });
  }
  
  const { vehicles, total, district, store, stores } = await availableVehiclesService.findAvailableVehicles(
    validated.data.storeId,
    validated.data.startTime,
    validated.data.endTime,
    validated.data.page,
    validated.data.limit,
    validated.data.latitude,
    validated.data.longitude
  );

  const vehiclesWithUrls = await Promise.all(vehicles.map(async (vehicle) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicleObj: any = (vehicle as any).toObject ? (vehicle as any).toObject() : vehicle;
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
    message: "Available vehicles retrieved successfully",
    data: vehiclesWithUrls,
    metadata: {
      district: district,
      store: store,
      stores: stores, // Include sorted stores list
      pagination: {
        page: validated.data.page,
        limit: validated.data.limit,
        total,
        totalPages: Math.ceil(total / validated.data.limit),
        hasNext: validated.data.page * validated.data.limit < total,
        hasPrev: validated.data.page > 1,
      }
    },
  }, { status: HttpStatus.OK });
});

