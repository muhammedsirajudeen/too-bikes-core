import { IStore } from "../core/interface/model/IStore.model";
import { Schema, model, connection } from "mongoose";

const storeSchema = new Schema<IStore>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    location: {
      address: { type: String, required: true },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      }
    },

    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },

    contactNumber: { type: String, trim: true },

    images: [{ type: String }]
  },
  { timestamps: true }
);

storeSchema.index({ "location.coordinates": "2dsphere" });

// Prevent model overwrite during hot reloading in Next.js
export const StoreModel = connection.models.Store || model<IStore>("Store", storeSchema);
