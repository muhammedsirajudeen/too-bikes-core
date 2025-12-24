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
    username: { type: String, required: true },
    password: { type: String, required: true },
});


export const AdminModel = mongoose.model("Admin", adminSchema);