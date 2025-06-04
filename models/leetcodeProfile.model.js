// Model to user details from leetcode
import mongoose from "mongoose";

const leetcodeProfileSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    badge: {
      type: String,
      default: "No badge",
    },
    avatar: {
      type: String,
    },
    ranking: {
      type: Number,
      default: null,
    },
    country: {
      type: String,
      default: "Unknown",
    },
    linkedin: {
      type: String,
      default: "Not provided",
    },
    github: {
      type: String,
      default: "Not provided",
    },
    twitter: {
      type: String,
      default: "Not provided",
    },
    
  },
  {
    timestamps: true,
  }
);

const LeetcodeProfile = mongoose.model("LeetcodeProfile", leetcodeProfileSchema);
export default LeetcodeProfile;
