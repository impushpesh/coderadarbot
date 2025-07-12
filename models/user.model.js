// User model for MongoDB

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: Number,
      required: true,
      unique: true,
    },
    isBot: Boolean,
    firstName: String,
    lastName: String,
    username: String,
    languageCode: String,
    codeforcesId: {
      type: String,
      default: null,
    },
    codechefId: {
      type: String,
      default: null,
    },
    leetcodeId: {
      type: String,
      default: null,
    },
    contestAlertsEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
