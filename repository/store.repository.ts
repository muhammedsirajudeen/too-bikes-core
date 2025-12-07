import { BaseRepository } from "./base.respository";
import { StoreModel } from "@/model/store.model";
import { IStore } from "../core/interface/model/IStore.model";

export class StoreRepository extends BaseRepository<IStore> {
  constructor() {
    super(StoreModel);
  }

  async findStoresNear(
    longitude: number, 
    latitude: number, 
    radiusKm: number
  ): Promise<IStore[]> {
    // India bounds validation (Northern hemisphere)
    const isValidIndiaCoords = 
      latitude >= 8.0 && latitude <= 37.0 &&
      longitude >= 68.0 && longitude <= 97.5;

    if (!isValidIndiaCoords) {
      throw new Error('Coordinates must be within India bounds (latitude: 8.0-37.0, longitude: 68.0-97.5)');
    }

    try {
      return await StoreModel.find({
        "location.coordinates": {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: radiusKm * 1000
          }
        }
      });
    } catch (error) {
      // Handle MongoDB geospatial query errors
      if (error instanceof Error && error.message.includes('2dsphere')) {
        throw new Error('Geospatial index not found. Please ensure the store location index is created.');
      }
      throw error;
    }
  }
}