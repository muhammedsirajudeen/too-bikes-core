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
      return await this.model.find({
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

  /**
   * Find the nearest store to given coordinates
   */
  async findNearestStore(
    longitude: number,
    latitude: number
  ): Promise<IStore | null> {
    // India bounds validation (Northern hemisphere)
    const isValidIndiaCoords =
      latitude >= 8.0 && latitude <= 37.0 &&
      longitude >= 68.0 && longitude <= 97.5;

    if (!isValidIndiaCoords) {
      throw new Error('Coordinates must be within India bounds (latitude: 8.0-37.0, longitude: 68.0-97.5)');
    }

    try {
      const stores = await this.model.find({
        "location.coordinates": {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
          }
        }
      }).limit(1);

      return stores.length > 0 ? stores[0] : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('2dsphere')) {
        throw new Error('Geospatial index not found. Please ensure the store location index is created.');
      }
      throw error;
    }
  }

  /**
   * Get all active stores
   */
  async findAllStores(): Promise<IStore[]> {
    return await this.model.find({}).sort({ name: 1 });
  }

  /**
   * Get all stores sorted by distance from given coordinates
   * Returns all stores unsorted if coordinates are invalid or not provided
   */
  async findAllStoresSortedByDistance(
    longitude?: number,
    latitude?: number
  ): Promise<IStore[]> {
    // If no coordinates provided, return all stores unsorted
    if (!longitude || !latitude) {
      return await this.findAllStores();
    }

    // Validate India bounds
    const isValidIndiaCoords =
      latitude >= 8.0 && latitude <= 37.0 &&
      longitude >= 68.0 && longitude <= 97.5;

    if (!isValidIndiaCoords) {
      // Return all stores unsorted if coordinates are invalid
      return await this.findAllStores();
    }

    try {
      console.log('[findAllStoresSortedByDistance] Querying with coords:', { longitude, latitude });
      const stores = await this.model.find({
        "location.coordinates": {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] }
          }
        }
      });
      console.log('[findAllStoresSortedByDistance] Found stores:', stores.map(s => ({ name: s.name, id: s._id })));
      return stores;
    } catch (error) {
      // Fallback to unsorted if geospatial query fails
      console.error('Geospatial query failed:', error);
      return await this.findAllStores();
    }
  }
}