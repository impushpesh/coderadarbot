// Model to store the details of upcoming codeforce contests
import mongoose from "mongoose";

const upcomingContestSchema = new mongoose.Schema({
  contestId: { type: String, required: true },
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  platform: { type: String, required: true },
});

const UpcomingContest = mongoose.model(
  "UpcomingContest",
  upcomingContestSchema
);

export default UpcomingContest;
