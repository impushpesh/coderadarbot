// Model to store the details/history of contests given by the user on CodeChef
import mongoose from "mongoose";

const codechefContestSchema = new mongoose.Schema(
  {
    handle: {
      type: String,
      required: true,
      unique: true,
    },
    getyear: {
      type: String,
      required: true,
    },
    getmonth: {
      type: String,
      required: true,
    },
    getday: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    rank: {
      type: String,
    },
    reason: {
      type: String,
      default: null,
    },
    penalised_in: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const CodechefContest = mongoose.model("CodechefContest", codechefContestSchema);
export default CodechefContest;
