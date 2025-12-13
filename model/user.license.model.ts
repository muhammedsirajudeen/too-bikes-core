//userId references user
//frontImage link to image
//backImage link to image
import mongoose from "mongoose";


const userLicenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    frontImage: {
        type: String,
        required: true
    },
    backImage: {
        type: String,
        required: true
    }
});

const userLicenseModel = mongoose.model("UserLicense", userLicenseSchema);

export default userLicenseModel;
