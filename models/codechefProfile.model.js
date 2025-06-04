// Model to store user details from codechef
import mongoose from "mongoose";

const codechefProfileSchema = new mongoose.Schema({
    handle: { // codechef handle of the user
        type: String,
        required: true,
        unique: true,
    },
    profile:{ // profile image url
        type: String,
    },
    name: { // name of the user
        type: String,
        required: true,
    },
    currentRating: {
        type: Number,
        default: 0,
    },
    highestRating: { 
        type: Number,
        default: 0,
    },
    countryName: {
        type: String,
        default: "Not specified",
    },
    globalRank:{
        type: Number,
        default: 0,
    },
    countryRank: {
        type: Number,
        default: 0,
    },
    stars:{
        type: String,
        default: "Not specified",
    }
}, { timestamps: true });

const CodechefProfile = mongoose.model("CodechefProfile", codechefProfileSchema);
export default CodechefProfile;