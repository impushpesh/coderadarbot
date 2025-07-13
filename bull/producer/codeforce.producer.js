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
export const jobName = "trackCodeforcesRating";

// Create the BullMQ queue
export const codeforcesQueue = new Queue("codeforcesQueue", {
  connection: redisOptions,
});

// Cron-job to track rating changes every 3 days
logger.info("[PRODUCER] [codeforces.producer] Starting codeforces producer...");
export async function addJob(job) {
  const options = {
    repeat: { cron: "0 7 */3 * *" }, // Every 3 days at 7 AM- UTC
    //repeat: { every: 10000 }, // Every 10 seconds- For testing purposes
    removeOnComplete: true,
    jobId: job.name, // Avoid duplicates
  };

  await codeforcesQueue.add(job.name, job, options);
}

// Schedule the job
await addJob({ name: jobName });
logger.info(`[PRODUCER] [codeforces.producer] Scheduled job: ${jobName}`);
