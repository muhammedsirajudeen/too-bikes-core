import { IVehicle } from "../core/interface/model/IVehicle.model";
import { BaseRepository } from "./base.respository";
import { VehicleModel } from "@/model/vehicles.model";
import { Types } from "mongoose";

export class VehicleRepository extends BaseRepository<IVehicle> {
  constructor() {
    super(VehicleModel);
  }
  async findAvailableVehiclesByStores(
    storeIds: Types.ObjectId[],
    startTime: Date,
    endTime: Date,
    page = 1,
    limit = 10
  ): Promise<{ vehicles: IVehicle[]; total: number }> {
    const pipeline = [
      {
        $match: {
          store: { $in: storeIds },
          availability: true,
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
      total: result.total[0]?.count || 0
    };
  }

}
