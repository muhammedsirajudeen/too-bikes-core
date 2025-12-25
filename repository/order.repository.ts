import { IOrder } from "../core/interface/model/IOrder.model";
import { BaseRepository } from "./base.respository";
import { OrderModel } from "@/model/orders.model";
import { ClientSession, Types } from "mongoose";

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
      .populate("vehicle", "name brand image fuelType pricePerDay pricePerHour licensePlate")
      .populate("store", "name address contactNumber openingTime closingTime location")
      .exec();
  }

  /**
   * Find all orders with populated references (for admin)
   */
  async findAllWithPopulate(): Promise<IOrder[]> {
    return this.model
      .find()
      .populate("user", "name phoneNumber email")
      .populate("vehicle", "name brand licensePlate")
      .populate("store", "name location")
      .sort({ createdAt: -1 })
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

  /**
   * Find orders by user ID with pagination and populated references
   */
  async findByUserIdWithPagination(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    orders: IOrder[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      this.model
        .find({ user: userId })
        .populate("vehicle", "name brand image fuelType pricePerDay pricePerHour")
        .populate("store", "name address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments({ user: userId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }


  async create(data: Partial<IOrder>, session?: ClientSession): Promise<IOrder> {
    const doc = new this.model(data);
    await doc.save({ session });
    return doc;
  }

}
