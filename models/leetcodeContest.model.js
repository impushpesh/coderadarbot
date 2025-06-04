// Model to store the details/history contests given by the user on leetcode
import mongoose from "mongoose";

const contestEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startTime: {
    type: Number, // Unix timestamp
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  ranking: {
    type: Number,
    required: true,
  },
  attended: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const leetcodeContestSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    attendedContestsCount: {
      type: Number,
      required: true,
    },
    currentRating: {
      type: Number,
      required: true,
    },
    history: {
      type: [contestEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const LeetcodeContest = mongoose.model("LeetcodeContest", leetcodeContestSchema);
export default LeetcodeContest;
