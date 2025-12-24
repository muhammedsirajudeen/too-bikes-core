/**
 * Admin Model
 * interface IAdmin{
 *  username
 *  password
 * }
 */

import mongoose from "mongoose";

export interface IAdmin {
    username: string;
    password: string;
}

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
});


//singleton for models
export const AdminModel = mongoose.models.Admin || mongoose.model("Admin", adminSchema);