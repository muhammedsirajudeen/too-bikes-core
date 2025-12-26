/**
 * Admin Model
 * interface IAdmin{
 *  username
 *  password
 *  role
 * }
 */

import mongoose from "mongoose";
import { AdminRole } from "@/constants/permissions.constant";

export interface IAdmin {
    username: string;
    password: string;
    role: AdminRole;
}

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: Object.values(AdminRole), 
        default: AdminRole.STAFF,
        required: true 
    },
});


//singleton for models
export const AdminModel = mongoose.models.Admin || mongoose.model("Admin", adminSchema);