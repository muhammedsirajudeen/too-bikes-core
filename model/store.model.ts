import { IStore } from "../core/interface/model/IStore.model";
import { Schema, model, models } from "mongoose";

const storeSchema = new Schema<IStore>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    address: { type: String, required: true },
    district: { type: String, required: true },

    latitude: { type: Number },
    longitude: { type: Number },

    location: {
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

export const StoreModel = models.Store || model<IStore>("Store", storeSchema);
