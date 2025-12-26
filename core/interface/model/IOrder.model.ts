import { Document, Types } from "mongoose";
import { IVehicle } from "./IVehicle.model";
import { IStore } from "./IStore.model";
import IUser from "./IUser.model";

export interface IOrder extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId | IUser;

  vehicle: Types.ObjectId | IVehicle;
  store: Types.ObjectId | IStore;

  startTime: Date;
  endTime: Date;

  totalAmount: number;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // License snapshot at time of order creation
  license?: {
    frontImage: string; // S3 storage key for front of license
    backImage: string;  // S3 storage key for back of license
  };

  status:
  | "pending"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "rejected";

  paymentStatus: "pending" | "paid" | "refunded";

  cancellationReason?: string;
  rejectionReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
