import { StoreRepository } from "@/repository/store.repository";
import { VehicleRepository } from "@/repository/vehicle.repository";

export class AvailableVehiclesService {
  constructor(
    private readonly storeRepo = new StoreRepository(),
    private readonly vehicleRepo = new VehicleRepository()
  ) {}

  async findAvailableVehicles(
    latitude: number,
    longitude: number,
    radiusKm: number,
    startTime: Date,
    endTime: Date
  ) {
    // 1️⃣ Find nearby stores using geospatial query
    const nearbyStores = await this.storeRepo.findStoresNear(
      longitude,
      latitude,
      radiusKm
    );

    const storeIds = nearbyStores.map((s) => s._id);

    if (storeIds.length === 0) return [];

    // 2️⃣ Find vehicles from those stores
    const vehicles = await this.vehicleRepo.findAll({
      store: { $in: storeIds },
      availability: true,
      isActive: true,
    });

    const availableVehicles = [];

    // 3️⃣ Filter vehicles that are not already booked
    for (const vehicle of vehicles) {
      const isAvailable = await this.vehicleRepo.isVehicleAvailable(
        vehicle._id.toString(),
        startTime,
        endTime
      );

      if (isAvailable) availableVehicles.push(vehicle);
    }

    return availableVehicles;
  }
}
