import { Schema, model, models } from "mongoose";
import IUser from "../core/interface/model/IUser.model";
import { hashPassword } from "@/utils";

const userSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid Indian phone number"],
    },
    name: { type: String, required: false, trim: true },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allows multiple null values
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
// userSchema.index({ phoneNumber: 1 }); // Primary lookup
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });

export const UserModel = models.User || model<IUser>("User", userSchema);
