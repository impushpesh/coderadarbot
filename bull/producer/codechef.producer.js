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
export const jobName = "trackCodechefRating";

// Create the BullMQ queue
export const codechefQueue = new Queue("codechefQueue", {
  connection: redisOptions,
});

// Cron-job to track rating changes every 3 days
logger.info("[PRODUCER] [codechef.producer] Starting codechef producer...");
export async function addJob(job) {
  const options = {
    repeat: { cron: "0 2 * * 4" }, // Every Thursday at 2 AM
    //repeat: { every: 10000 }, // Every 10 seconds- For testing purposes
    removeOnComplete: true,
    jobId: job.name, // Avoid duplicates
  };

  await codechefQueue.add(job.name, job, options);
}

// Schedule the job
await addJob({ name: jobName });
logger.info(`[PRODUCER] [codechef.producer] Scheduled job: ${jobName}`);
