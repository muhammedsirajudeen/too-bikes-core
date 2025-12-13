import { StoreRepository } from "@/repository/store.repository";
import { VehicleRepository } from "@/repository/vehicle.repository";
import { toObjectId } from "@/utils";

export class AvailableVehiclesService {
  constructor(
    private readonly storeRepo = new StoreRepository(),
    private readonly vehicleRepo = new VehicleRepository()
  ) { }

  async findAvailableVehicles(
    storeId: string,
    startTime: Date,  // ISO8601 parsed
    endTime: Date,    // ISO8601 parsed
    page: number,
    limit: number
  ) {
    try {
      // Verify store exists
      const store = await this.storeRepo.findById(toObjectId(storeId));

      if (!store) {
        throw new Error("Store not found");
      }

      // Get vehicles from this specific store
      return this.vehicleRepo.findAvailableVehiclesByStores(
        [toObjectId(storeId)],
        startTime,
        endTime,
        page,
        limit,
        store.district,
        store
      );
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to find available vehicles: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findVehicleById(vehicleId: string) {
    return this.vehicleRepo.findVehicleByIdWithStore(toObjectId(vehicleId));
  }


}
