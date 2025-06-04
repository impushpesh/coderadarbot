// Model to store the codeforces user data
import mongoose from "mongoose";

const codeforcesProfileSchema = new mongoose.Schema(
  {
    handle: {
      type: String,
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
    },
    maxRating: {
      type: Number,
    },
    rank: {
      type: String,
    },
    maxRank: {
      type: String,
    },
    contribution: {
      type: Number,
    },
    avatar: {
      type: String,
    },
    titlePhoto: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    registrationTimeSeconds: {
      type: Number,
    },
    lastOnlineTimeSeconds: {
      type: Number,
    },
  },
  { timestamps: true }
);

const codeforcesProfileModel = mongoose.model(
  "CodeforcesProfile",
  codeforcesProfileSchema
);
export default codeforcesProfileModel;
