// This code sets up a BullMQ queue to track codeforce rating changes in the users profile.
import { Queue } from "bullmq";
import dotenv from "dotenv";
import logger from "../../logger/logger.js";

dotenv.config();

// Redis connection options based on environment
export const redisOptions =
  process.env.NODE_ENV === "production"
    ? { url: process.env.REDIS_URL }
    : { host: "localhost", port: 6379 };

// Name of the job
export const jobName = "trackLeetcodeRating";

// Create the BullMQ queue
export const leetcodeQueue = new Queue("leetcodeQueue", {
  connection: redisOptions,
});

// Cron-job to track rating changes every Mon, Wed, and Fri at 3 PM
logger.info("[PRODUCER] [leetcode.producer] Starting leetcode producer...");
export async function addJob(job) {
  const options = {
    repeat: { cron: "0 15 * * 1,3,5" }, // Every Mon, Wed, and Fri at 3 PM
    //repeat: { every: 10000 }, // Every 10 seconds- For testing purposes
    removeOnComplete: true,
    jobId: job.name, // Avoid duplicates
  };

  await leetcodeQueue.add(job.name, job, options);
}

// Schedule the job
await addJob({ name: jobName });
logger.info(`[PRODUCER] [leetcode.producer] Scheduled job: ${jobName}`);
