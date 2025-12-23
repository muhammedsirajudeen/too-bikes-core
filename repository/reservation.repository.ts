import { IReservation, ReservationModel } from "@/model/reservation.model";
import { BaseRepository } from "./base.respository";
import { ClientSession } from "mongoose";

export class ReservationRepository extends BaseRepository<IReservation> {
  constructor() {
    super(ReservationModel);
  }

    /**
     * Create a pending reservation (used during payment lock)
     */
    async createPendingReservation(
        data: {
        vehicle_id: string;
        start_time: Date;
        end_time: Date;
        expiry: Date;
        },
        session?: ClientSession
    ): Promise<IReservation> {
        const reservation = new this.model({
        ...data,
        status: "pending",
        });

        await reservation.save({ session });
        return reservation;
    }

    /**
     * Check for any overlapping reservation (pending or confirmed)
     */
    async findOverlappingReservation(
        vehicleId: string,
        bufferedStart: Date,
        bufferedEnd: Date,
        session: ClientSession
    ): Promise<IReservation | null> {
        return this.model
        .findOne({
            vehicle_id: vehicleId,
            status: { $in: ["pending", "confirmed"] },
            start_time: { $lt: bufferedEnd },
            end_time: { $gt: bufferedStart },
        })
        .session(session)
        .lean()
        .exec();
    }

    async confirmReservation(
        reservationId: string,
    ): Promise<void> {
        await this.model.updateOne(
            { _id: reservationId, status: 'pending' },
            { $set: { status: 'confirmed' }, $unset: { expiry: '' } }
        );
    }

    async linkOrderToReservation(reservationId: string, orderId: string, session?: ClientSession) {
        await this.model.updateOne(
            { _id: reservationId },
            { $set: { order_id: orderId } },
            { session }
        );
    }

    async update(id: string, data: Partial<IReservation>, session?: ClientSession) {
        return this.model.findByIdAndUpdate(id, data, { new: true, session });
    }

    /**
     * Confirm reservation by Razorpay order ID (used in webhook & reconciliation)
     */
    async confirmReservationByRazorpayOrderId(razorpayOrderId: string): Promise<void> {
        const result = await this.model.updateOne(
            { 
            razorpay_order_id: razorpayOrderId,
            status: 'pending' 
            },
            { 
            $set: { status: 'confirmed' }, 
            $unset: { expiry: '' } 
            }
        );

        if (result.modifiedCount === 0) {
            // This is CRITICAL — log this loudly in production
            console.warn(`[WEBHOOK] No pending reservation found for razorpay_order_id: ${razorpayOrderId} or already confirmed/expired`);
            // Optionally throw or send to monitoring (Sentry, etc.)
        }
    }

    async setRazorpayOrderId(
        reservationId: string, 
        razorpayOrderId: string, 
        session?: ClientSession
        ): Promise<void> {
        await this.model.updateOne(
            { _id: reservationId },
            { $set: { razorpay_order_id: razorpayOrderId } },
            { session }
        );
    }

}
