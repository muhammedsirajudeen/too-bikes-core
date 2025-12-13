//userId references user
//frontImage link to image
//backImage link to image
import mongoose from "mongoose";
import { models } from "mongoose";


const userLicenseSchema = new mongoose.Schema({
    userId: {
        type: String, // Changed to String to support phoneNumber as userId
        required: true,
        index: true
    },
    frontImage: {
        type: String,
        required: true
    },
    backImage: {
        type: String,
        required: true
    }
}, { timestamps: true });

//implement singleton pattern
const userLicenseModel = models.UserLicense || mongoose.model("UserLicense", userLicenseSchema);

export default userLicenseModel;
