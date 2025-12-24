import { IVehicle } from "../core/interface/model/IVehicle.model";
import { IStore } from "../core/interface/model/IStore.model";
import { BaseRepository } from "./base.respository";
import { VehicleModel } from "@/model/vehicles.model";
import { ClientSession, Types } from "mongoose";

export class VehicleRepository extends BaseRepository<IVehicle> {
  constructor() {
    super(VehicleModel);
  }
  async findAvailableVehiclesByStores(
    storeIds: Types.ObjectId[],
    startTime: Date,
    endTime: Date,
    page = 1,
    limit = 10,
    district: string,
    store?: IStore | null
  ): Promise<{ vehicles: IVehicle[]; total: number; district: string; store?: IStore | null }> {
    const pipeline = [
      {
        $match: {
          store: { $in: storeIds },
          $or: [{ availability: { $exists: false } }, { availability: null }, { availability: true }],
          isActive: true
        }
      },
      {
        $lookup: {
          from: "orders",
          let: { vehicleId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$vehicle", "$$vehicleId"] },
                status: { $in: ["confirmed", "ongoing"] },
                startTime: { $lte: endTime },
                endTime: { $gte: startTime }
              }
            }
          ],
          as: "conflictingOrders"
        }
      },
      { $match: { conflictingOrders: { $size: 0 } } },
      { $project: { conflictingOrders: 0 } },
      {
        $facet: {
          vehicles: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: "count" }]
        }
      }
    ];

    const [result] = await VehicleModel.aggregate(pipeline);
    return {
      vehicles: result.vehicles,
      total: result.total[0]?.count || 0,
      district,
      store
    };
  }

  /**
   * Find a vehicle by its ID and populate store details
   */
  async findVehicleByIdWithStore(vehicleId: Types.ObjectId | string): Promise<IVehicle | null> {
    return VehicleModel.findById(vehicleId)
      .populate("store")
      .exec();
  }

  async updateAvailability(vehicleId: Types.ObjectId | string, availability: Types.ObjectId, session: ClientSession): Promise<IVehicle | null> {
    return VehicleModel.findByIdAndUpdate(vehicleId, { availability }, { new: true }).session(session).exec();
  } 

}
