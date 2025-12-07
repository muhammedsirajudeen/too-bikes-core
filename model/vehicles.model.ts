import { IVehicle } from "../core/interface/model/IVehicle.model";
import { Schema, model, connection } from "mongoose";

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

    availability: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Prevent model overwrite during hot reloading in Next.js
export const VehicleModel = connection.models.Vehicle || model<IVehicle>("Vehicle", vehicleSchema);
