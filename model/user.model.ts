import { Schema, model } from "mongoose";
import IUser from "../core/interface/model/IUser.model";
import { hashPassword } from "@/utils";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: { type: String, required: false },
    role: {
      type: String,
      enum: ["client", "trainer", "admin"],
      default: "client",
    },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await hashPassword(this.password as string);
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const UserModel = model<IUser>("User", userSchema);
