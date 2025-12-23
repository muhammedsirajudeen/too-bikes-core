import { StoreRepository } from "@/repository/store.repository";
import { VehicleRepository } from "@/repository/vehicle.repository";
import { toObjectId } from "@/utils";

export class AvailableVehiclesService {
  constructor(
    private readonly storeRepo = new StoreRepository(),
    private readonly vehicleRepo = new VehicleRepository()
  ) { }

  async findAvailableVehicles(
    storeId: string | undefined,
    startTime: Date,  // ISO8601 parsed
    endTime: Date,    // ISO8601 parsed
    page: number,
    limit: number,
    latitude?: number,
    longitude?: number
  ) {
    try {
      // Get all stores sorted by distance (if location provided)
      const stores = await this.storeRepo.findAllStoresSortedByDistance(longitude, latitude);
      
      if (stores.length === 0) {
        throw new Error("No stores available");
      }

      // Scenario 1: Specific store requested
      if (storeId) {
        const selectedStore = stores.find(s => s._id.toString() === storeId);
        if (!selectedStore) {
          // If not found in sorted list, fetch it directly
          const store = await this.storeRepo.findById(toObjectId(storeId));
          if (!store) {
            throw new Error("Store not found");
          }
          
          const vehicleData = await this.vehicleRepo.findAvailableVehiclesByStores(
            [store._id],
            startTime,
            endTime,
            page,
            limit,
            store.district,
            store
          );
          
          return {
            ...vehicleData,
            stores,
          };
        }
        
        const vehicleData = await this.vehicleRepo.findAvailableVehiclesByStores(
          [selectedStore._id],
          startTime,
          endTime,
          page,
          limit,
          selectedStore.district,
          selectedStore
        );
        
        return {
          ...vehicleData,
          stores,
        };
      }

      // Scenario 2: No storeId - check if location is provided
      if (latitude && longitude) {
        // Location provided - use nearest store
        const nearestStore = stores[0];
        
        const vehicleData = await this.vehicleRepo.findAvailableVehiclesByStores(
          [nearestStore._id],
          startTime,
          endTime,
          page,
          limit,
          nearestStore.district,
          nearestStore
        );
        
        return {
          ...vehicleData,
          stores,
        };
      }

      // Scenario 3: No storeId and no location - show vehicles from ALL stores
      const allStoreIds = stores.map(s => s._id);
      
      const vehicleData = await this.vehicleRepo.findAvailableVehiclesByStores(
        allStoreIds,
        startTime,
        endTime,
        page,
        limit,
        "All Locations", // Show "All Locations" as district
        null // No specific store
      );
      
      return {
        ...vehicleData,
        stores,
      };
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to find available vehicles: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findVehicleById(vehicleId: string) {
    return this.vehicleRepo.findVehicleByIdWithStore(toObjectId(vehicleId));
  }


}
