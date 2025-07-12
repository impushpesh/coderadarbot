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
export const jobName = "fetchUpcomingContests";

// Create the BullMQ queue
export const contestQueue = new Queue("contestQueue", {
  connection: redisOptions,
});

// Cron-job to fetch contests every 3 days
logger.info("[PRODUCER] [fetchContest.producer] Starting contest producer...");
export async function addJob(job) {
  const options = {
    repeat: { cron: "0 0 */3 * *" }, // Every 3 days at midnight
    //repeat: { every: 5000 }, // Every 5 seconds- For testing purposes
    removeOnComplete: true,
    jobId: job.name, // Avoid duplicates
  };

  await contestQueue.add(job.name, job, options);
}

// Schedule the job
await addJob({ name: jobName });
logger.info(`[PRODUCER] [fetchContest.producer] Scheduled job: ${jobName}`);
