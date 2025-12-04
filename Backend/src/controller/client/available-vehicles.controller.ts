import { Request, Response, NextFunction } from "express";
import { ControllerErrorHandler } from "@/utils/controller-error-handler.util";
import { AvailableVehiclesService } from "@/services/client/available-vehicles.service";

export class AvailableVehiclesController {
  constructor(
    private readonly availableVehiclesService = new AvailableVehiclesService()
  ) {}

  findAvailableVehicles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude, radiusKm, startTime, endTime } = req.query;

      if (!latitude || !longitude || !radiusKm || !startTime || !endTime) {
        return res.status(400).json({
          message: "Missing required query params: latitude, longitude, radiusKm, startTime, endTime"
        });
      }

      const vehicles = await this.availableVehiclesService.findAvailableVehicles(
        Number(latitude),
        Number(longitude),
        Number(radiusKm),
        new Date(startTime as string),
        new Date(endTime as string)
      );

      ControllerErrorHandler.handleSuccess(
        res,
        vehicles,
        "Available vehicles retrieved successfully"
      );
    } catch (error) {
      ControllerErrorHandler.handleError(error, res, next);
    }
  };
}
