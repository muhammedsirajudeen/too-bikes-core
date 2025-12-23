import { HttpStatus } from "@/constants/status.constant";
import { IVehicle } from "@/core/interface/model/IVehicle.model";
import { IStore } from "@/core/interface/model/IStore.model";
import { querySchema } from "@/lib/schemas/availableVehicles.schema";
import { AvailableVehiclesService } from "@/services/server/available-vehicles.service";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";

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

  return NextResponse.json({
    success: true,
    message: "Available vehicles retrieved successfully",
    data: vehicles,
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

