import { IVehicle } from "../core/interface/model/IVehicle.model";
import { BaseRepository } from "./base.respository";
import { VehicleModel } from "@/model/vehicles.model";
import { OrderModel } from "@/model/orders.model";

export class VehicleRepository extends BaseRepository<IVehicle> {
  constructor() {
    super(VehicleModel);
  }
  async isVehicleAvailable(vehicleId: string, start: Date, end: Date): Promise<boolean> {
    const overlappingOrder = await OrderModel.findOne({
      vehicle: vehicleId,
      status: { $in: ["confirmed", "ongoing"] },
      $or: [
        { startTime: { $lte: end }, endTime: { $gte: start } }
      ]
    });

    return !overlappingOrder;
  }

}
