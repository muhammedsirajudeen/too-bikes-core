import { env } from "@/config/env.config";
import { OrderRepository } from "@/repository/order.repository";
import { ReservationRepository } from "@/repository/reservation.repository";
import mongoose from "mongoose";
import { toObjectId } from "@/utils/convert-object-id.util";


interface MongoTransactionError extends Error {
  errorLabels?: string[];
  codeName?: string;
}

import Razorpay from 'razorpay'; // npm install razorpay
import crypto from 'crypto';
import { VehicleRepository } from "@/repository/vehicle.repository";


export class Order2Service {
    
    constructor(
        private readonly orderRepository = new OrderRepository(),
        private readonly reservationRepository = new ReservationRepository(),
        private readonly vehicleRepository = new VehicleRepository(),
        private razorpay: any = new Razorpay({
          key_id: env.RAZORPAY_KEY  || "",
          key_secret: env.RAZORPAY_SECRET || "",
        })
    ) {}


    // async attemptBooking(vehicleId:string, startTime:Date, endTime:Date, userId:string) {
    //     const session = await mongoose.startSession();
    //     const timeoutMin = parseInt(env.RESERVATION_TIMEOUT_MIN || '5');
    //     const bufferMin = parseInt(env.BOOKING_BUFFER_MIN || '180');  // 3 hours, dynamic
    //     let success = false;
    //     let retries = 3;

    //     while (retries > 0 && !success) {
    //         session.startTransaction();
    //         try {
    //         // Calculate buffered range for overlap check
    //         const bufferedStart = new Date(startTime.getTime() - bufferMin * 60000);
    //         const bufferedEnd = new Date(endTime.getTime() + bufferMin * 60000);

    //         // Check for overlaps: Any res where (res.start < bufferedEnd AND res.end > bufferedStart)
    //         // ✅ Overlap check via repository
    //         const overlap =
    //             await this.reservationRepository.findOverlappingReservation(
    //                 vehicleId,
    //                 bufferedStart,
    //                 bufferedEnd,
    //                 session
    //             );
 
    //         // const overlap = await Reservation.findOne({
    //         //     vehicle_id: vehicleId,
    //         //     $or: [{ status: 'confirmed' }, { status: 'pending' }],
    //         //     start_time: { $lt: bufferedEnd },
    //         //     end_time: { $gt: bufferedStart }
    //         // }).session(session);

    //         if (overlap) {
    //             await session.abortTransaction();
    //             throw new Error('Vehicle not available in this time slot');
    //         }

    //         // Create pending reservation
    //         const expiry = new Date(Date.now() + timeoutMin * 60000);
    //         // ✅ Create pending reservation via repository
    //         const reservation =
    //             await this.reservationRepository.createPendingReservation(
    //                 {
    //                     vehicle_id: vehicleId,
    //                     start_time: startTime,
    //                     end_time: endTime,
    //                     expiry,
    //                 },
    //                 session
    //             );
        
    //         // const res = new Reservation({
    //         //     vehicle_id: vehicleId,
    //         //     start_time: startTime,
    //         //     end_time: endTime,
    //         //     status: 'pending',
    //         //     expiry
    //         // });
    //         // await res.save({ session });

    //         await session.commitTransaction();
    //         success = true;

    //         // Now create Razorpay order, pass res._id as metadata
    //         // const razorOrder = await createRazorpayOrder(amount, res._id);
    //         return { reservationId: reservation._id /*, razorOrder */ };
    //         } catch (error: unknown) {
    //             await session.abortTransaction();

    //             if (
    //                 error instanceof Error &&
    //                 (
    //                 (error as MongoTransactionError).errorLabels?.includes("TransientTransactionError") ||
    //                 (error as MongoTransactionError).codeName === "WriteConflict"
    //                 )
    //             ) {
    //                 retries--;
    //                 continue;
    //             }

    //             throw error;
    //         }
    //         finally {
    //             session.endSession();
    //         }
    //     }
    //     if (!success) throw new Error('Booking failed after retries');
    // }

    // On Razorpay webhook success:
    
    // async attemptBooking(
    //     vehicleId: string,
    //     startTime: Date,
    //     endTime: Date,
    //     userId: string,
    //     totalAmount: number, // calculate this properly based on duration/pricing
    //     storeId: string // assuming you have this
    //     ) {
    //     const session = await mongoose.startSession();
    //     const timeoutMin = parseInt(env.RESERVATION_TIMEOUT_MIN || '5');
    //     const bufferMin = parseInt(env.BOOKING_BUFFER_MIN || '180');
    //     let success = false;
    //     let retries = 3;

    //     while (retries > 0 && !success) {
    //         await session.startTransaction();
    //         try {
    //         const bufferedStart = new Date(startTime.getTime() - bufferMin * 60000);
    //         const bufferedEnd = new Date(endTime.getTime() + bufferMin * 60000);

    //         const overlap = await this.reservationRepository.findOverlappingReservation(
    //             vehicleId,
    //             bufferedStart,
    //             bufferedEnd,
    //             session
    //         );

    //         if (overlap) {
    //             await session.abortTransaction();
    //             throw new Error('Vehicle not available in this time slot');
    //         }

    //         // Create pending reservation
    //         const expiry = new Date(Date.now() + timeoutMin * 60000);
    //         const reservation = await this.reservationRepository.createPendingReservation(
    //             {
    //             vehicle_id: vehicleId,
    //             start_time: startTime,
    //             end_time: endTime,
    //             expiry,
    //             },
    //             session
    //         );

    //         // Create pending Order inside same transaction
    //         const order = await this.orderRepository.create(
    //             {
    //             user: toObjectId(userId),
    //             vehicle: toObjectId(vehicleId),
    //             store: toObjectId(storeId),
    //             startTime,
    //             endTime,
    //             totalAmount,
    //             status: 'pending',
    //             paymentStatus: 'pending',
    //             // we'll fill razorpayOrderId after creation
    //             },
    //             session
    //         );

    //         // Link them
    //         await this.reservationRepository.linkOrderToReservation(
    //             reservation._id.toString(),
    //             order._id.toString(),
    //             session
    //         );

    //         await this.vehicleRepository.updateAvailability(vehicleId, reservation._id, session);

    //         await session.commitTransaction();
    //         success = true;

    //         // NOW: Create Razorpay order (outside txn — it's idempotent and retryable)
    //         const razorpayOrder = await this.razorpay.orders.create({
    //             amount: totalAmount * 100, // in paise
    //             currency: 'INR',
    //             receipt: `order_${order._id}`,
    //             notes: {
    //             reservation_id: reservation._id.toString(),
    //             order_id: order._id.toString(),
    //             },
    //         });

    //         // Update Order with Razorpay ID (fire and forget — if fails, reconciliation will catch)
    //         await this.orderRepository.update(order._id.toString(), {
    //             razorpayOrderId: razorpayOrder.id,
    //         });

    //         // Optional: also store on reservation
    //         await this.reservationRepository.setRazorpayOrderId(
    //             reservation._id.toString(),
    //             razorpayOrder.id
    //         );

    //         return {
    //             orderId: order._id,
    //             reservationId: reservation._id,
    //             razorpayOrderId: razorpayOrder.id,
    //             amount: razorpayOrder.amount,
    //             currency: razorpayOrder.currency,
    //         };
    //         } catch (error: unknown) {
    //         await session.abortTransaction();
    //         if (
    //             error instanceof Error &&
    //             ((error as MongoTransactionError).errorLabels?.includes('TransientTransactionError') ||
    //             (error as MongoTransactionError).codeName === 'WriteConflict')
    //         ) {
    //             retries--;
    //             continue;
    //         }
    //         throw error;
    //         } finally {
    //         session.endSession();
    //         }
    //     }
    //     throw new Error('Booking failed after retries');
    // }

    async attemptBooking(vehicleId: string, startTime: Date, endTime: Date, userId: string, totalAmount: number, storeId: string) {
  const session = await mongoose.startSession();
  let retries = 5;  // more retries under load
  const bufferMin = parseInt(env.BOOKING_BUFFER_MIN || '180');
  const timeoutMin = parseInt(env.RESERVATION_TIMEOUT_MIN || '5');

  try {
    while (retries > 0) {
      try {
        await session.startTransaction();

        const bufferedStart = new Date(startTime.getTime() - bufferMin * 60000);
        const bufferedEnd = new Date(endTime.getTime() + bufferMin * 60000);

        console.log(`Attempting booking for vehicle ${vehicleId} - Retry left: ${retries}`);

        const overlap = await this.reservationRepository.findOverlappingReservation(
          vehicleId,
          bufferedStart,
          bufferedEnd,
          session
        );

        console.log(`Overlap check result: ${overlap ? 'FOUND' : 'NONE'}`);

        if (overlap) {
        //   await session.abortTransaction();
          throw new Error('Vehicle not available in this time slot');  // immediate reject — no retry
        }

        const expiry = new Date(Date.now() + timeoutMin * 60000);
        const reservation = await this.reservationRepository.createPendingReservation(
          { vehicle_id: vehicleId, start_time: startTime, end_time: endTime, expiry },
          session
        );
        console.log(`Created reservation ${reservation._id} - committing`);

        const order = await this.orderRepository.create(
          {
            user: toObjectId(userId),
            vehicle: toObjectId(vehicleId),
            store: toObjectId(storeId),
            startTime,
            endTime,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
          },
          session
        );

        await this.reservationRepository.linkOrderToReservation(reservation._id.toString(), order._id.toString(), session);

        // Remove the vehicle availability update if you haven't already — it's trash

        await session.commitTransaction();

        // ONLY AFTER SUCCESSFUL COMMIT — create Razorpay
        const razorpayOrder = await this.razorpay.orders.create({
          amount: totalAmount * 100,
          currency: 'INR',
          receipt: `order_${order._id}`,
          notes: { reservation_id: reservation._id.toString(), order_id: order._id.toString() },
        });

        // Non-critical updates — no session
        await Promise.all([
          this.orderRepository.update(order._id.toString(), { razorpayOrderId: razorpayOrder.id }),
          this.reservationRepository.setRazorpayOrderId(reservation._id.toString(), razorpayOrder.id)
        ]);

        return {
          orderId: order._id,
          reservationId: reservation._id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        };

      } catch (error: any) {

        
        await session.abortTransaction();

        // ONLY retry on actual write conflict
        if (
          error.errorLabels?.includes('TransientTransactionError') ||
          error.codeName === 'WriteConflict'
        ) {
          retries--;
          if (retries > 0) continue;  // retry same transaction
        }

        // For availability error — throw immediately, no retry
        if (error.message.includes('Vehicle not available')) {
          throw error;
        }

        // Other errors — throw
        throw error;
      }
    }

    throw new Error('Booking failed after multiple retries due to high contention');
  } finally {
    await session.endSession();  // ONLY ONCE, outside loop
  }
}

    async confirmBooking(reservationId:string) {
        await this.reservationRepository.confirmReservation(reservationId);
        // await this.reservationRepository.updateOne(
        //     { _id: reservationId, status: 'pending' },
        //     { $set: { status: 'confirmed' }, $unset: { expiry: '' } }
        // );
        // If not found, it expired—log and ignore, or notify.
    }

    // Webhook handler (critical — make idempotent)
    async handleRazorpayWebhook(payload: any, signature: string) {
    // Verify signature first
    const expectedSig = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET ?? "")
        .update(JSON.stringify(payload))
        .digest('hex');

    if (expectedSig !== signature) throw new Error('Invalid signature');

    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
        const razorpayOrderId = payload.payload.payment?.entity?.order_id || payload.payload.order?.entity?.id;

        // Find order by razorpayOrderId
        const order = await this.orderRepository.findOne({ razorpayOrderId });

        if (!order || order.paymentStatus === 'paid') return; // idempotent

        // Confirm both
        await this.orderRepository.update(order._id.toString(), {
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId: payload.payload.payment?.entity?.id,
        razorpaySignature: signature,
        });

        await this.reservationRepository.confirmReservationByRazorpayOrderId(razorpayOrderId);
    }
    }
}