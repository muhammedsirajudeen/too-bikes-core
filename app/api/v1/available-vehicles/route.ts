import { AvailableVehiclesService } from "@/services/client/available-vehicles.service";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { ValidationError } from "@/utils/validation.util";
import { NextRequest, NextResponse } from "next/server";

const availableVehiclesService = new AvailableVehiclesService();

export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url);

  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  const radiusKm = url.searchParams.get("radiusKm");
  const startTime = url.searchParams.get("startTime");
  const endTime = url.searchParams.get("endTime");
  
  if (!latitude || !longitude || !radiusKm || !startTime || !endTime) {
    throw new ValidationError([
        { field: "latitude", message: !latitude ? "latitude is required" : "" },
        { field: "longitude", message: !longitude ? "longitude is required" : "" },
        { field: "radiusKm", message: !radiusKm ? "radiusKm is required" : "" },
        { field: "startTime", message: !startTime ? "startTime is required" : "" },
        { field: "endTime", message: !endTime ? "endTime is required" : "" },
    ].filter(e => e.message));
  }

  const vehicles = await availableVehiclesService.findAvailableVehicles(
    Number(latitude),
    Number(longitude),
    Number(radiusKm),
    new Date(startTime),
    new Date(endTime)
  );

  return NextResponse.json({
    success: true,
    message: "Available vehicles retrieved successfully",
    data: vehicles,
  });
});
