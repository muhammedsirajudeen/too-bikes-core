import {  Document, ObjectId } from 'mongoose';

// User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "client" | "trainer" | "admin";
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default IUser;