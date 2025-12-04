import { BaseRepository } from "./base.respository";
import { StoreModel } from "@/model/store.model";
import { IStore } from "@/core/interface/model/IStore.model";

export class StoreRepository extends BaseRepository<IStore> {
  constructor() {
    super(StoreModel);
  }

  async findStoresNear(longitude: number, latitude: number, radiusKm: number) {
    return StoreModel.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusKm * 1000  // convert km → meters
        }
      }
    });
  }
}
