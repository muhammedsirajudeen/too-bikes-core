import { Document, Types } from "mongoose";
import { IVehicle } from "./IVehicle.model";
import { IStore } from "./IStore.model";
import IUser from "./IUser.model";

export interface IOrder extends Document{
  _id: Types.ObjectId;

  user: Types.ObjectId | IUser;

  vehicle: Types.ObjectId | IVehicle;
  store: Types.ObjectId | IStore;

  startTime: Date;
  endTime: Date;

  totalAmount: number;

  status: 
    | "pending"
    | "confirmed"
    | "ongoing"
    | "completed"
    | "cancelled";

  paymentStatus: "pending" | "paid" | "refunded";

  cancellationReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
