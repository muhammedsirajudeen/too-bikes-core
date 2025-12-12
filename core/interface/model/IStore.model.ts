import { Document, Types } from "mongoose";

export interface IStore extends Document {
  _id: Types.ObjectId;

  name: string;
  description?: string;

  address: string;
  district: string;
  location: {
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
  };

  openingTime: string; // "09:00"
  closingTime: string; // "21:00"

  contactNumber?: string;

  images?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}
