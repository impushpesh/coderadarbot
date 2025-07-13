// Worker to fetch upcoming contests from Codeforces and notify users
import { Worker } from "bullmq";
import dotenv from "dotenv";
import logger from "../../logger/logger.js";
import UpcomingContest from "../../models/upcomingContest.model.js";
import { getUpcomingCodeforcesContests } from "../../services/codeforce.api.js";
import { redisOptions, jobName } from "../producer/contest.producer.js";
import connectDB from "../../lib/connection.js";

import User from "../../models/user.model.js";
import { Telegraf } from "telegraf";
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Connect to MongoDB
await connectDB();
logger.info("[WORKER] [fetchContestWorker] Connected to MongoDB");

// Job handler map
const jobHandlers = {
  fetchUpcomingContests: async () => {
    try {
      logger.info("[WORKER] [fetchContestWorker] Fetching Codeforces contests...");

      const newContests = await getUpcomingCodeforcesContests();

      // Get old contest IDs
      const oldContests = await UpcomingContest.find({
        platform: "codeforces",
      });
      const oldIds = new Set(oldContests.map((c) => c.contestId));

      // Detect truly new contests (not in DB before)
      const freshContests = newContests.filter(
        (contest) => !oldIds.has(String(contest.id))
      );

      if (freshContests.length === 0) {
        logger.info(
          "[WORKER] [fetchContestWorker] No new contests found. Skipping DB update and notifications."
        );
        return;
      }

      logger.info(`[WORKER] [fetchContestWorker] ${freshContests.length} new contests found.`);

      // Delete old and insert new
      await UpcomingContest.deleteMany({ platform: "codeforces" });

      const docs = newContests.map((c) => ({
        contestId: String(c.id),
        name: c.name,
        startTime: new Date(c.startTimeSeconds * 1000),
        duration: c.durationSeconds,
        platform: "codeforces",
      }));
      await UpcomingContest.insertMany(docs);
      logger.info(`[WORKER] [fetchContestWorker] Saved ${docs.length} contests.`);

      // Notify users only about the new ones
      const usersToNotify = await User.find({ contestAlertsEnabled: true });

      for (const user of usersToNotify) {
        for (const contest of freshContests) {
          const startTime = new Date(
            contest.startTimeSeconds * 1000
          ).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
          });

          const message = `
<b>New Codeforces Contest!</b>
<b>${contest.name}</b>
<b>Starts at:</b> ${startTime}
<b>Duration:</b> ${contest.durationSeconds / 3600} hrs
<a href="https://codeforces.com/contests">View on Codeforces</a>
        `.trim();

          await bot.telegram.sendMessage(user.telegramId, message, {
            parse_mode: "HTML",
          });
        }

        logger.info(`[NOTIFY] [fetchContestWorker] Notified user ${user.telegramId}`);
      }
    } catch (err) {
      logger.error(`[WORKER] [fetchContestWorker] Error in fetchUpcomingContests: ${err.message}`);
    }
  },
};

// Worker setup
const worker = new Worker(
  "contestQueue",
  async (job) => {
    logger.info(`[WORKER] [fetchContestWorker] Processing job: ${job.name}`);
    const handler = jobHandlers[job.name];

    if (!handler) {
      logger.error(
        `[WORKER] [fetchContestWorker] No handler for job: ${job.name}`
      );
      throw new Error(`No handler for job: ${job.name}`);
    }

    await handler(job);
  },
  { connection: redisOptions }
);

// Events
worker.on("completed", (job) => {
  logger.info(
    `[WORKER] [fetchContestWorker] Job ${job.name} (${job.id}) completed`
  );
});

worker.on("failed", (job, err) => {
  logger.error(
    `[WORKER] [fetchContestWorker] Job ${job.name} (${job.id}) failed: ${err.message}`
  );
});

logger.info("[WORKER] [fetchContestWorker] Contest worker started.");
