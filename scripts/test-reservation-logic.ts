
// import mongoose from 'mongoose';
// import { Order2Service } from '../services/server/order2.service';
// import { ReservationModel } from '../model/reservation.model';
// import { OrderModel } from '../model/orders.model';
// import { VehicleModel } from '../model/vehicles.model';
// import { env } from '../config/env.config';

// // Mock Razorpay
// const mockRazorpay = {
//   orders: {
//     create: async () => ({
//       id: 'rzp_mock_id_' + Math.random().toString(36).substring(7),
//       amount: 1000,
//       currency: 'INR'
//     })
//   }
// };

// // Mock Session for Standalone Mongo
// mongoose.startSession = async () => {
//   return {
//     startTransaction: () => {},
//     commitTransaction: () => {},
//     abortTransaction: () => {},
//     endSession: () => {},
//     inTransaction: () => false, // Set false to avoid transaction headers
//     id: new mongoose.Types.ObjectId(),
//   } as any;
// };

// // PATCH: Strip session from repository calls to avoid "IllegalOperation" on standalone
// import { ReservationRepository } from '../repository/reservation.repository';
// import { OrderRepository } from '../repository/order.repository';
// import { VehicleRepository } from '../repository/vehicle.repository';

// // Helper to patch
// function patchRepo(RepoClass: any, methodName: string) {
//   const original = RepoClass.prototype[methodName];
//   RepoClass.prototype[methodName] = async function(...args: any[]) {
//     // Last arg is usually session, replace with undefined
//     const newArgs = [...args];
//     if (newArgs.length > 0) newArgs[newArgs.length - 1] = undefined; 
//     // This assumes session is ALWAYS last arg. In OrderRepository.create it is optional 2nd arg.
//     // Order2Service calls: create(data, session) -> 2 args. 
//     // updateAvailability(id, avail, session) -> 3 args.
//     return original.apply(this, newArgs);
//   };
// }

// // Apply patches
// patchRepo(ReservationRepository, 'findOverlappingReservation');
// patchRepo(ReservationRepository, 'createPendingReservation');
// patchRepo(ReservationRepository, 'linkOrderToReservation');
// patchRepo(OrderRepository, 'create');
// patchRepo(VehicleRepository, 'updateAvailability');


// async function runTests() {
//   console.log('Connecting to MongoDB...');
//   // Ensure we use the correct specific collection or logic
//   // Assume locally running mongo or env connection string
//   // If env.MONGODB_URI is not set, we might fail. 
//   // We'll rely on the existing env config if possible, or fall back to local default.
//   const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/toobikes-core';
  
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(uri);
//   }
  
//   console.log('Connected.');

//   // Override Env vars for Test
//   process.env.RESERVATION_TIMEOUT_MIN = '5';
//   process.env.BOOKING_BUFFER_MIN = '180'; // 3 hours

//   const service = new Order2Service(undefined, undefined, undefined, mockRazorpay);
//   const vehicleId = new mongoose.Types.ObjectId().toString();
//   const userId = new mongoose.Types.ObjectId().toString();
//   const storeId = new mongoose.Types.ObjectId().toString();

//   // Cleanup
//   await ReservationModel.deleteMany({ vehicle_id: vehicleId });
//   await OrderModel.deleteMany({ vehicle: vehicleId });

//   console.log(`\n--- Test Settings ---`);
//   console.log(`Vehicle ID: ${vehicleId}`);
//   console.log(`Buffer: 180 min (3h)`);
//   console.log(`Timeout: 5 min`);

//   // --- Scenario 1: Book 10am - 2pm ---
//   // Use a fixed date to be deterministic
//   const baseDate = new Date(); 
//   baseDate.setHours(10, 0, 0, 0); // Today 10:00 AM
//   const startTime1 = new Date(baseDate);
//   const endTime1 = new Date(baseDate);
//   endTime1.setHours(14, 0, 0, 0); // Today 2:00 PM

//   console.log(`\n[Test 1] Attempt booking 10:00 - 14:00 (Should Success)`);
//   try {
//     const res = await service.attemptBooking(vehicleId, startTime1, endTime1, userId, 500, storeId);
//     console.log('✅ Success:', res.reservationId);
//   } catch (err) {
//     console.error('❌ Failed:', err);
//     process.exit(1);
//   }


//   // --- Scenario 2: Overlap (12:00 - 13:00) ---
//   const startOverlap = new Date(baseDate); startOverlap.setHours(12, 0, 0, 0);
//   const endOverlap = new Date(baseDate); endOverlap.setHours(13, 0, 0, 0);

//   console.log(`\n[Test 2] Attempt overlap booking 12:00 - 13:00 (Should Fail)`);
//   try {
//     await service.attemptBooking(vehicleId, startOverlap, endOverlap, userId, 200, storeId);
//     console.error('❌ Unexpected Success (Should have failed)');
//   } catch (err: any) {
//     console.log('✅ Correctly Failed:', err.message);
//   }


//   // --- Scenario 3: Buffer Check (15:00 - 16:00) ---
//   // Previous Ended 14:00. Buffer 3h -> 17:00.
//   // 15:00 is INSIDE buffer (14:00 - 17:00). Should Fail.
//   const startBuffer = new Date(baseDate); startBuffer.setHours(15, 0, 0, 0);
//   const endBuffer = new Date(baseDate); endBuffer.setHours(16, 0, 0, 0);

//   console.log(`\n[Test 3] Attempt buffer booking 15:00 - 16:00 (Should Fail due to 3h buffer)`);
//   try {
//     await service.attemptBooking(vehicleId, startBuffer, endBuffer, userId, 200, storeId);
//     console.error('❌ Unexpected Success (Should have failed)');
//   } catch (err: any) {
//     console.log('✅ Correctly Failed:', err.message);
//   }


//   // --- Scenario 4: After Window (17:00 onwards) ---
//   // Previous Ended 14:00. Buffer 3h -> 17:00.
//   // So 17:00 - 18:00 should be Valid.
//   const startValid = new Date(baseDate); startValid.setHours(17, 0, 0, 0);
//   const endValid = new Date(baseDate); endValid.setHours(18, 0, 0, 0);

//   console.log(`\n[Test 4] Attempt booking 17:00 - 18:00 (Should Success)`);
//   try {
//     const res = await service.attemptBooking(vehicleId, startValid, endValid, userId, 500, storeId);
//     console.log('✅ Success:', res.reservationId);
//   } catch (err) {
//     console.error('❌ Failed:', err);
//   }


//   // --- Scenario 5: Expiry / TTL Invalidates Window ---
//   // Previous Ended 21:00 (effective).
//   // Let's create a new booking at 22:00 (Safe).
  
//   // 1. Create conflicts
//   const startExp = new Date(baseDate); startExp.setHours(22, 0, 0, 0);
//   const endExp = new Date(baseDate); endExp.setHours(23, 0, 0, 0);
  
//   console.log(`\n[Test 5] Expiry Logic`);
//   console.log(`   Step A: Book 22:00-23:00 (Pending)`);
//   const resExp = await service.attemptBooking(vehicleId, startExp, endExp, userId, 500, storeId);
//   console.log('   Booked:', resExp.reservationId);

//   // 2. Try booking overlap (22:30-23:30) -> Fail
//   const startConflict = new Date(baseDate); startConflict.setHours(22, 30, 0, 0);
//   const endConflict = new Date(baseDate); endConflict.setHours(23, 30, 0, 0);
//   try {
//       await service.attemptBooking(vehicleId, startConflict, endConflict, userId, 500, storeId);
//     console.error('   ❌ Step B Failed: Overlap succeeded unexpectedly');
//   } catch (e) {
//       console.log('   ✅ Step B: Overlap correctly rejected');
//   }

//   // 3. Simulate Expiry (Delete the reservation)
//   console.log(`   Step C: Simulate TTL Expiry (Deleting reservation ${resExp.reservationId})`);
//   await ReservationModel.deleteOne({ _id: resExp.reservationId });

//   // 4. Try booking overlap again -> Success
//   console.log(`   Step D: Retry booking 20:30-21:30 (Should Success now)`);
//   try {
//       const resRetry = await service.attemptBooking(vehicleId, startConflict, endConflict, userId, 500, storeId);
//       console.log('   ✅ Success:', resRetry.reservationId);
//   } catch (e) {
//       console.error('   ❌ Failed:', e);
//   }

//   console.log('\nDone.');
//   await mongoose.disconnect();
// }

// runTests().catch(console.error);



// import mongoose from 'mongoose';
// import { Order2Service } from '../services/server/order2.service';
// import { ReservationModel } from '../model/reservation.model';
// import { OrderModel } from '../model/orders.model';
// import { env } from '../config/env.config';
// import { ReservationRepository } from '../repository/reservation.repository';
// import { OrderRepository } from '../repository/order.repository';
// import { VehicleRepository } from '../repository/vehicle.repository';

// // Mock Razorpay
// const mockRazorpay = {
//   orders: {
//     create: async () => ({
//       id: 'rzp_mock_id_' + Math.random().toString(36).substring(7),
//       amount: 1000,
//       currency: 'INR'
//     })
//   }
// };

// // Mock Session for Standalone Mongo
// mongoose.startSession = async () => {
//   return {
//     startTransaction: () => {},
//     commitTransaction: () => {},
//     abortTransaction: () => {},
//     endSession: () => {},
//     inTransaction: () => false, // Set false to avoid transaction headers
//     id: new mongoose.Types.ObjectId(),
//   } as any;
// };

// async function runTests() {
//   console.log('Connecting to MongoDB...');
//   const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/toobikes-test';
  
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(uri);
//   }
//   console.log('Connected.');

//   // Override env
//   process.env.RESERVATION_TIMEOUT_MIN = '5';
//   process.env.BOOKING_BUFFER_MIN = '0'; // Set to 0 for concurrency test — no buffer noise

//   // Instantiate Repositories
//   const orderRepo = new OrderRepository();
//   const resRepo = new ReservationRepository();
//   const vehicleRepo = new VehicleRepository();

//   // Helper to patch INSTANCES directly (safer)
//   function patchInstance(instance: any, methodName: string) {
//     const original = instance[methodName];
//     // If it's on prototype, grab it from there
//     const protoMethod = Object.getPrototypeOf(instance)[methodName];
//     const targetMethod = original || protoMethod;

//     instance[methodName] = async function(...args: any[]) {
//       // console.log(`[PATCH] Calling ${instance.constructor.name}.${methodName} - Removing Session`);
//       const newArgs = [...args];
//       if (newArgs.length > 0) newArgs[newArgs.length - 1] = undefined; 
//       return targetMethod.apply(this, newArgs);
//     };
//   }

//   // Apply patches to instances
//   patchInstance(resRepo, 'findOverlappingReservation');
//   patchInstance(resRepo, 'createPendingReservation');
//   patchInstance(resRepo, 'linkOrderToReservation');
//   patchInstance(orderRepo, 'create');
//   patchInstance(vehicleRepo, 'updateAvailability');

//   // Inject into Service
//   const service = new Order2Service(orderRepo, resRepo, vehicleRepo, mockRazorpay as any);

//   const vehicleId = new mongoose.Types.ObjectId().toString();
//   const userId = new mongoose.Types.ObjectId().toString();
//   const storeId = new mongoose.Types.ObjectId().toString();

//   // Cleanup everything for this vehicle
//   await ReservationModel.deleteMany({ vehicle_id: vehicleId });
//   await OrderModel.deleteMany({ vehicle: vehicleId });

//   const baseDate = new Date();
//   baseDate.setHours(10, 0, 0, 0); // Fixed 10:00 AM
//   const startTime = new Date(baseDate);
//   const endTime = new Date(baseDate);
//   endTime.setHours(14, 0, 0, 0); // 2:00 PM

//   console.log(`\n🚀 CONCURRENCY STRESS TEST`);
//   console.log(`Vehicle: ${vehicleId}`);
//   console.log(`Slot: ${startTime.toISOString()} → ${endTime.toISOString()}`);
//   console.log(`Firing TWO identical bookings AT THE SAME TIME...\n`);

//   // 🔥 FIRE TWO IDENTICAL BOOKINGS IN PARALLEL
//   const user1 = new mongoose.Types.ObjectId().toString();
//   const user2 = new mongoose.Types.ObjectId().toString();

//   const [result1, result2] = await Promise.allSettled([
//     service.attemptBooking(vehicleId, startTime, endTime, user1, 500, storeId),
//     service.attemptBooking(vehicleId, startTime, endTime, user2, 500, storeId)
//   ]);

//   const successes = [result1, result2].filter(r => r.status === 'fulfilled');
//   const failures = [result1, result2].filter(r => r.status === 'rejected');

//   console.log(`Results:`);
//   console.log(`   Successes: ${successes.length}`);
//   console.log(`   Failures:  ${failures.length}`);

//   // 🔴 ASSERTIONS
//   if (successes.length === 0) {
//     console.error('💥 BOTH FAILED: No booking succeeded.');
//     console.error('Failure reasons:', failures.map(f => (f as any).reason.message));
//     process.exit(1);
//   }

//   if (successes.length > 1) {
//     console.error('💥 CATASTROPHIC FAILURE: More than one booking succeeded → OVERSOLD!');
//     console.error('Your transaction/retry logic is flawed under real concurrency.');
//     process.exit(1);
//   }

//   if (failures.length !== 1) {
//     console.error('💥 Both failed → something wrong with first booking');
//     process.exit(1);
//   }

//   const failedReason = (failures[0] as any).reason.message;
//   if (!failedReason.includes('Vehicle not available')) {
//     console.error(`💥 Wrong failure message: "${failedReason}"`);
//     console.error('Expected: "Vehicle not available in this time slot"');
//     process.exit(1);
//   }

//   console.log('✅ PASSED: Only ONE booking succeeded, the other correctly rejected.');
//   console.log('   Winner reservation:', (successes[0] as any).value.reservationId);

//   // Optional: Run 10x more to be ruthless
//   console.log('\n🔥 Running 10-round stress test...');
//   for (let i = 0; i < 10; i++) {
//     await ReservationModel.deleteMany({ vehicle_id: vehicleId });
//     await OrderModel.deleteMany({ vehicle: vehicleId });

//     const [r1, r2] = await Promise.allSettled([
//       service.attemptBooking(vehicleId, startTime, endTime, userId, 500, storeId),
//       service.attemptBooking(vehicleId, startTime, endTime, userId, 500, storeId)
//     ]);

    
//     const succ = [r1, r2].filter(r => r.status === 'fulfilled').length;
//     console.log(await ReservationModel.find())
//     if (succ !== 1) {
//       console.error(`💥 Round ${i+1} failed: ${succ} successes`);
//       process.exit(1);
//     }
//   }
//   console.log('✅ All 10 rounds passed: Always exactly ONE winner.');

//   // Your old sequential tests (buffer, overlap, etc.) can go here if you want
//   // But concurrency is the one that matters.

//   console.log('\n🎉 Concurrency protection PROVEN bulletproof.');
//   await mongoose.disconnect();
// }

// runTests().catch(err => {
//   console.error('Test crashed:', err);
//   process.exit(1);
// });



import mongoose from 'mongoose';
import { Order2Service } from '../services/server/order2.service';
import { ReservationModel } from '../model/reservation.model';
import { OrderModel } from '../model/orders.model';

// Mock Razorpay only (keep this — fine for test)
const mockRazorpay: {
    orders: {
        create: () => Promise<{
            id: string;
            amount: number;
            currency: string;
        }>;
    };
} = {
  orders: {
    create: async () => ({
      id: 'rzp_mock_id_' + Math.random().toString(36).substring(7),
      amount: 1000,
      currency: 'INR'
    })
  }
};

async function runTests() {
  console.log('Connecting to Atlas...');
  const uri = 'gave your atlas url';

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      dbName: 'tooBikes'  // optional, but clear
    });
  }
  console.log('Connected to Atlas.');

  // SAFE DROP — don't crash the whole test if it fails
  try {
    await ReservationModel.collection.drop();
    console.log('Dropped reservations collection');
  } catch (err:unknown) {
    if (err instanceof Error && err.message.includes('ns not found')) {
      console.log('Collection not found — fresh start');
    } else {
      console.warn('Could not drop collection (likely in use or throttled):', err);
      // Continue anyway — deleteMany will clean
    }
  }

  // Force index sync
  try {
    await ReservationModel.syncIndexes();
    console.log('Indexes synced');
  } catch (err:unknown) {
    if (err instanceof Error) {
      console.warn('Index sync failed:', err.message);
    } else {
      console.warn('Index sync failed:', err);
    }
  }

  process.env.RESERVATION_TIMEOUT_MIN = '5';
  process.env.BOOKING_BUFFER_MIN = '0';

  // NO REPOSITORIES INJECTED — let service create its own (or inject clean ones)
  // const service = new Order2Service();
  const service = new Order2Service(undefined, undefined, undefined, undefined, mockRazorpay);

  const vehicleId = new mongoose.Types.ObjectId().toString();
  const storeId = new mongoose.Types.ObjectId().toString();

  // Cleanup
  await ReservationModel.deleteMany({ vehicle_id: vehicleId });
  await OrderModel.deleteMany({ vehicle: vehicleId });

  const baseDate = new Date('2025-12-24'); // fixed date to avoid timezone mess
  baseDate.setHours(10, 0, 0, 0);
  const startTime = new Date(baseDate);
  const endTime = new Date(baseDate);
  endTime.setHours(14, 0, 0, 0);

  console.log(`\n🚀 REAL CONCURRENCY TEST ON ATLAS`);
  console.log(`Slot: ${startTime.toISOString()} → ${endTime.toISOString()}\n`);

  const promises = [];
  for (let i = 0; i < 20; i++) {  // 20 concurrent attempts
    const userId = new mongoose.Types.ObjectId().toString();
    promises.push(service.attemptBooking(vehicleId, startTime, endTime, userId, 500, storeId));
  }

  const results = await Promise.allSettled(promises);
  const successes = results.filter(r => r.status === 'fulfilled');
  const failures = results.filter(r => r.status === 'rejected');

  console.log(`Results from 20 concurrent bookings:`);
  console.log(`   Successes: ${successes.length}`);
  console.log(`   Failures:  ${failures.length}`);

  if (successes.length !== 1) {
    console.error('💥 OVERSOLD OR NO SALE — SYSTEM STILL BROKEN');
    process.exit(1);
  }

  const failedMessages = failures.map(f => (f as any).reason?.message || 'Unknown error');
  const unavailableCount = failedMessages.filter(m => m.includes('Vehicle not available')).length;

  if (unavailableCount !== 19) {
    console.error(`💥 Wrong failure reasons — expected 19 "Vehicle not available", got ${unavailableCount}`);
    console.error('Sample failures:', failedMessages.slice(0, 5));
    process.exit(1);
  }

  console.log('✅ BULLETPROOF: Exactly ONE booking succeeded, 19 correctly rejected.');

  // Quick DB check
  const count = await ReservationModel.countDocuments({ vehicle_id: vehicleId });
  console.log(`Final pending reservations for this vehicle: ${count} (should be 1)`);

  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});