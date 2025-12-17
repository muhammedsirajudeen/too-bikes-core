/**
 * interface userFavoriteModel{
 *  userId references user
 * vehicleId references vehicle
 * }
 */

import mongoose from "mongoose";

const userFavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    }
});

const UserFavoriteModel = mongoose.models.UserFavorite || mongoose.model("UserFavorite", userFavoriteSchema);
export default UserFavoriteModel