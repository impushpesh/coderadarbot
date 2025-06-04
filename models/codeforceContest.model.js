// Model to store the rating history contests given by the user on codeforces

import mongoose from "mongoose";

const codeforceContestSchema = new mongoose.Schema(
  {
    handle: {
      type: String,
      required: true,
      unique: true, 
    },
    contestId: {
      type: Number,
      required: true,
    },
    contestName: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
    },
    ratingUpdateTimeSeconds: {
      type: Number,
    },
    oldRating: {
      type: Number,
    },
    newRating: {
      type: Number,
    }
  },
  { timestamps: true }
);

const CodeforceContest = mongoose.model("CodeforceContest", codeforceContestSchema);
export default CodeforceContest;
