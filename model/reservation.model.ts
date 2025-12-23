import mongoose, { models, Document } from "mongoose";

export interface IReservation extends Document {
  vehicle_id: string;
  start_time: Date;
  end_time: Date;
  status: 'pending' | 'confirmed';
  expiry?: Date;
  order_id: string;
  razorpay_order_id: string; // only for pending reservations
}


const ReservationSchema = new mongoose.Schema({
  vehicle_id: { type: String, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  expiry: { type: Date },  // Only set for pending
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // link to Order
  razorpay_order_id: { type: String, unique: true, sparse: true }, // for reconciliation
},{timestamps:true});
// TTL index: Expires pending docs after expiry
ReservationSchema.index({ expiry: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'pending' } });
ReservationSchema.index(
  { vehicle_id: 1, start_time: 1, end_time: 1 },
  { unique: true }
);
export const ReservationModel = models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);