import { Document, Types } from "mongoose";
import { IStore } from "./IStore.model";
import { IReservation } from "@/model/reservation.model";

export interface IVehicle extends Document {
  _id: Types.ObjectId;

  store: Types.ObjectId | IStore;

  name: string;
  description?: string;

  brand: string;
  modelYear?: number;

  fuelType: "petrol" | "diesel" | "electric";

  pricePerHour: number;
  pricePerDay: number;

  mileage?: number;

  licensePlate: string;

  image?: string[];

  availability: Types.ObjectId | IReservation;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
