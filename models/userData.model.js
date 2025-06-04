// will contain the users data fetched from the api- codeforcedata, leetcodedata, codechef data along with contests and rating history
// Links all models together
import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema({
  telegramID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // Codeforces Profile
  codeforces: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodeforcesProfile",
    default: null,
  },

  // Codeforces Contest History
  codeforcesContests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeforceContest",
    },
  ],

  // Codechef Profile
  codechef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodechefProfile",
    default: null,
  },

  // Codechef Contest History
  codechefContests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodechefContest",
    },
  ],

  // Leetcode Profile
  leetcode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeetcodeProfile",
    default: null,
  },

  // Leetcode Contest History
  leetcodeContests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeetcodeContest",
    },
  ],
});

const UserData = mongoose.model("UserData", userDataSchema);
export default UserData;