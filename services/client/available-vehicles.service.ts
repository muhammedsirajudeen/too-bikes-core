import { StoreRepository } from "@/repository/store.repository";
import { VehicleRepository } from "@/repository/vehicle.repository";
import { toObjectId } from "@/utils";

export class AvailableVehiclesService {
  constructor(
    private readonly storeRepo = new StoreRepository(),
    private readonly vehicleRepo = new VehicleRepository()
  ) {}

  async findAvailableVehicles(
    latitude: number,
    longitude: number,
    radiusKm: number,
    startTime: Date,  // ISO8601 parsed
    endTime: Date,    // ISO8601 parsed
    page: number,
    limit: number
  ) {
    try {
      const nearbyStores = await this.storeRepo.findStoresNear(longitude, latitude, radiusKm);
      
      if (nearbyStores.length === 0) return { vehicles: [], total: 0 };

      const storeIds = nearbyStores.map(s => s._id);
      
      return this.vehicleRepo.findAvailableVehiclesByStores(storeIds, startTime, endTime, page, limit);
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to find available vehicles: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findVehicleById(vehicleId: string) {
    return this.vehicleRepo.findVehicleByIdWithStore(toObjectId(vehicleId));
  }


}
