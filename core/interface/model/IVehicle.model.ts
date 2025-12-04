import { Document, Types } from "mongoose";
import { IStore } from "./IStore.model";

export interface IVehicle extends Document {
  _id: Types.ObjectId;

  store: Types.ObjectId | IStore;

  name: string;
  description?: string;

  brand: string;
  modelYear?: number;

  fuelType: "petrol" | "diesel" | "electric";

  pricePerHour: number;
  pricePerDay?: number;

  mileage?: number;

  licensePlate: string;

  image?: string[];

  availability: boolean;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
