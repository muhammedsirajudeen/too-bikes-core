import { Document, ObjectId } from 'mongoose';

// User Interface
export interface IUser extends Document {
  phoneNumber: string; // Primary identifier for OTP-based auth
  name?: string; // Optional - may not be provided initially
  email?: string; // Optional - may not be provided initially
  password?: string; // Optional - not used for OTP auth
  role: "client" | "trainer" | "admin";
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default IUser;