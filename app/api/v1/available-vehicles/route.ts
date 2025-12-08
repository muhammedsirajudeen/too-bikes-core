import { HttpStatus } from "@/constants/status.constant";
import { AvailableVehiclesService } from "@/services/client/available-vehicles.service";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  latitude: z.coerce.number().min(8.0).max(37.0),
  longitude: z.coerce.number().min(68.0).max(97.5),
  radiusKm: z.coerce.number().min(1).max(100),
  startTime: z.string().datetime({ message: "Must be ISO8601 format" }).transform(v => new Date(v)),
  endTime: z.string().datetime({ message: "Must be ISO8601 format" }).transform(v => new Date(v)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
}).refine(data => data.endTime > data.startTime, {
  message: "endTime must be after startTime",
  path: ["endTime"]
});

export interface VehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
  metadata: {
    pagination: Pagination;
  };
}

export interface Vehicle {
  _id: string;
  store: string;
  name: string;
  brand: string;
  fuelType: "petrol" | "electric" | "diesel"; // narrowed based on provided data
  pricePerHour: number;
  licensePlate: string;
  image: string[];
  availability: boolean;
  isActive: boolean;
  createdAt: string; // can change to Date if needed
  updatedAt: string; // can change to Date if needed
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
    },{status: HttpStatus.BAD_REQUEST});
  }
  const { vehicles, total } = await availableVehiclesService.findAvailableVehicles(
    validated.data.latitude,
    validated.data.longitude,
    validated.data.radiusKm,
    validated.data.startTime,
    validated.data.endTime,
    validated.data.page,
    validated.data.limit
  );

  return NextResponse.json({
    success: true,
    message: "Available vehicles retrieved successfully",
    data: vehicles,
    metadata: {
      pagination:{
        page: validated.data.page,
        limit: validated.data.limit,
        total,
        totalPages: Math.ceil(total / validated.data.limit),
        hasNext: validated.data.page * validated.data.limit < total,
        hasPrev: validated.data.page > 1,
      }
    },
  },{ status: HttpStatus.OK });
});
