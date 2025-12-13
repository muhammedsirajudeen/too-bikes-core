import { IOrder } from "../core/interface/model/IOrder.model";
import { BaseRepository } from "./base.respository";
import { OrderModel } from "@/model/orders.model";
import { Types } from "mongoose";

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }

  /**
   * Find order by ID with populated references
   */
  async findByIdWithPopulate(id: string): Promise<IOrder | null> {
    return this.model
      .findById(id)
      .populate("user", "name phoneNumber email")
      .populate("vehicle", "name brand image fuelType pricePerDay pricePerHour")
      .populate("store", "name address contactNumber openingTime closingTime")
      .exec();
  }

  /**
   * Find orders by user ID with populated references
   */
  async findByUserIdWithPopulate(userId: Types.ObjectId): Promise<IOrder[]> {
    return this.model
      .find({ user: userId })
      .populate("vehicle", "name brand image fuelType")
      .populate("store", "name address")
      .sort({ createdAt: -1 })
      .exec();
  }
}
