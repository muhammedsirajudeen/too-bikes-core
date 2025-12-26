  import { IOrder } from "../core/interface/model/IOrder.model";
  import { Schema, model, models } from "mongoose";

  const orderSchema = new Schema<IOrder>(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
      store: { type: Schema.Types.ObjectId, ref: "Store", required: true },

      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },

      totalAmount: { type: Number, required: true },

      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },

      // License snapshot at time of order creation
      license: {
        frontImage: { type: String }, // S3 storage key for front of license
        backImage: { type: String }   // S3 storage key for back of license
      },

      status: {
        type: String,
        enum: ["pending", "confirmed", "ongoing", "completed", "cancelled", "rejected"],
        default: "pending"
      },

      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending"
      },

      cancellationReason: { type: String },
      rejectionReason: { type: String }
    },
    { timestamps: true }
  );

  export const OrderModel = models.Order || model<IOrder>("Order", orderSchema);
