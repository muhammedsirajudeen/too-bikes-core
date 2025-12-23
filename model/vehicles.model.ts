import { IVehicle } from "../core/interface/model/IVehicle.model";
import { Schema, model, models } from "mongoose";

const vehicleSchema = new Schema<IVehicle>(
  {
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },

    name: { type: String, required: true },
    description: { type: String },

    brand: { type: String, required: true },
    modelYear: { type: Number },

    fuelType: { type: String, enum: ["petrol", "diesel", "electric"], required: true },

    pricePerHour: { type: Number, required: true },
    pricePerDay: { type: Number },

    mileage: { type: Number },

    licensePlate: { type: String, required: true, unique: true },

    image: [{ type: String }],

    availability: { type: Schema.Types.ObjectId, ref: "Reservation" },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const VehicleModel = models.Vehicle || model<IVehicle>("Vehicle", vehicleSchema);
