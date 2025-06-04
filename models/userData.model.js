// will contain the users data fetched from the api- codeforcedata, leetcodedata, codechef data
import mongoose from "mongoose";

// Codeforce data schema
const codeforcesProfileSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  maxRating: {
    type: Number,
  },
  rank:{
    type: String,
  },
  maxRank:{
    type: String,
  },
  contribution:{
    type: Number,
  },
  avatar: {
    type: String,
  },
  titlePhoto:{
    type: String,
  },
  country: {
    type: String,
  },
  city:{
    type: String,
  },
  registrationTimeSeconds: {
    type: Number,
  },
  lastOnlineTimeSeconds: {
    type: Number,
  },
  
});

const userDataSchema = new mongoose.Schema({
  telegramID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // Codeforces data
  codeforces: {
    type: codeforcesProfileSchema,
    default: null,
  },
});

const UserData = mongoose.model("UserData", userDataSchema);
export default UserData;
