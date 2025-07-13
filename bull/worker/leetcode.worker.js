// Worker that checks for Leetcode rating changes and notifies users via Telegram.
import { Worker } from "bullmq";
import dotenv from "dotenv";
import logger from "../../logger/logger.js";
import connectDB from "../../lib/connection.js";

import User from "../../models/user.model.js";
import leetcodeProfileModel from "../../models/leetcodeProfile.model.js";
import { getLeetCodeRatingInfo } from "../../services/leetcode.api.js";
import { Telegraf } from "telegraf";
import { redisOptions } from "../producer/codeforce.producer.js";

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Connect to MongoDB
await connectDB();
logger.info("[WORKER] [leetcodeRatingWorker] Connected to MongoDB");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const jobHandlers = {
  trackLeetcodeRating: async () => {
    logger.info("[WORKER] [leetcodeRatingWorker] Starting Leetcode rating change job...");

    const users = await User.find({}, "telegramId leetcodeId");

    for (const user of users) {
      if (!user.leetcodeId) continue;

      try {
        const userInfo = await getLeetCodeRatingInfo(user.leetcodeId);
        if (!userInfo) {
          logger.warn(`[WORKER] [leetcodeRatingWorker] No info found for ${user.leetcodeId}`);
          continue;
        }

        const history = userInfo.history?.filter((entry) => entry.attended) || [];
        if (history.length < 2) {
          logger.warn(`[WORKER] [leetcodeRatingWorker] Not enough contest history for ${user.leetcodeId}`);
          continue;
        }

        const latest = history[history.length - 1];
        const previous = history[history.length - 2];

        const ratingChange = (latest.rating - previous.rating).toFixed(2);
        const rankingChange = latest.ranking - previous.ranking;

        const profile = await leetcodeProfileModel.findOne({ username: userInfo.username });
        if (!profile) {
          logger.warn(`[WORKER] [leetcodeRatingWorker] No profile in DB for username ${userInfo.username}`);
          continue;
        }

        if (latest.rating !== profile.rating) {
          logger.info(`[WORKER] [leetcodeRatingWorker] Rating changed for ${user.telegramId}: ${profile.rating} → ${latest.rating}`);

          profile.rating = latest.rating;
          profile.ranking = latest.ranking;
          await profile.save();

          await bot.telegram.sendMessage(
            user.telegramId,
            `<b>LeetCode Rating Updated!</b>\n<b>New Rating:</b> ${latest.rating} (${ratingChange >= 0 ? "+" : ""}${ratingChange})\n<b>Ranking:</b> ${latest.ranking} (${rankingChange >= 0 ? "+" : ""}${rankingChange})`,
            { parse_mode: "HTML" }
          );
        }
      } catch (error) {
        logger.error(`[WORKER] [leetcodeRatingWorker] Error processing user ${user.telegramId}:`, error);
      }

      await sleep(1000); // Prevent API abuse
    }

    logger.info("[WORKER] [leetcodeRatingWorker] Leetcode rating change job finished.");
  },
};

// Worker setup
const worker = new Worker(
  "leetcodeQueue",
  async (job) => {
    logger.info(`[WORKER] [leetcodeRatingWorker] Processing job: ${job.name}`);
    const handler = jobHandlers[job.name];

    if (!handler) {
      logger.error(`[WORKER] [leetcodeRatingWorker] No handler for job: ${job.name}`);
      throw new Error(`No handler for job: ${job.name}`);
    }

    await handler(job);
  },
  { connection: redisOptions }
);

worker.on("completed", (job) => {
  logger.info(`[WORKER] [leetcodeRatingWorker] Job ${job.name} (${job.id}) completed`);
});

worker.on("failed", (job, err) => {
  logger.error(`[WORKER] [leetcodeRatingWorker] Job ${job.name} (${job.id}) failed: ${err.message}`);
});

logger.info("[WORKER] [leetcodeRatingWorker] Worker started.");
