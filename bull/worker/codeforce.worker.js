// Worker that checks for Codeforces rating changes and notifies users via Telegram.
import { Worker } from "bullmq";
import dotenv from "dotenv";
import logger from "../../logger/logger.js";
import connectDB from "../../lib/connection.js";

import User from "../../models/user.model.js";
import codeforcesProfileModel from "../../models/codeforceProfile.model.js";
import { getCodeforceUserInfo } from "../../services/codeforce.api.js";
import { Telegraf } from "telegraf";
import { redisOptions } from "../producer/codeforce.producer.js";

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Connect to MongoDB
await connectDB();
logger.info("[WORKER] [ratingChangeWorker] Connected to MongoDB");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Job handler map
const jobHandlers = {
  trackCodeforcesRating: async () => {
    logger.info("[WORKER] [ratingChangeWorker] Starting Codeforces rating change job...");

    const users = await User.find({}, "telegramId codeforcesId");

    for (const user of users) {
      if (!user.codeforcesId) continue;

      try {
        const userInfo = await getCodeforceUserInfo(user.codeforcesId);
        if (!userInfo) {
          logger.warn(`[WORKER] [ratingChangeWorker] No info found for user ${user.telegramId}`);
          continue;
        }

        const profile = await codeforcesProfileModel.findOne({ handle: userInfo.handle });
        if (!profile) {
          logger.warn(`[WORKER] [ratingChangeWorker] No profile in DB for handle ${userInfo.handle}`);
          continue;
        }

        if (userInfo.rating !== profile.rating) {
          logger.info(`[WORKER] [ratingChangeWorker] Rating changed for ${user.telegramId}: ${profile.rating} → ${userInfo.rating}`);

          profile.rating = userInfo.rating;
          profile.maxRating = userInfo.maxRating;
          profile.rank = userInfo.rank;
          profile.maxRank = userInfo.maxRank;
          await profile.save();

          await bot.telegram.sendMessage(
            user.telegramId,
            `🎉 Your Codeforces rating has changed!\nNew Rating: <b>${userInfo.rating}</b>\nRank: ${userInfo.rank}`,
            { parse_mode: "HTML" }
          );
        }

        await sleep(4000); // Wait 4 seconds between API calls
      } catch (error) {
        logger.error(`[WORKER] [ratingChangeWorker] Error processing user ${user.telegramId}: ${error.message}`);
      }
    }

    logger.info("[WORKER] [ratingChangeWorker] Codeforces rating change job finished.");
  },
};

// Worker setup
const worker = new Worker(
  "codeforcesQueue",
  async (job) => {
    logger.info(`[WORKER] [ratingChangeWorker] Processing job: ${job.name}`);
    const handler = jobHandlers[job.name];

    if (!handler) {
      logger.error(`[WORKER] [ratingChangeWorker] No handler for job: ${job.name}`);
      throw new Error(`No handler for job: ${job.name}`);
    }

    await handler(job);
  },
  { connection: redisOptions }
);

// Events
worker.on("completed", (job) => {
  logger.info(`[WORKER] [ratingChangeWorker] Job ${job.name} (${job.id}) completed`);
});

worker.on("failed", (job, err) => {
  logger.error(`[WORKER] [ratingChangeWorker] Job ${job.name} (${job.id}) failed: ${err.message}`);
});

logger.info("[WORKER] [ratingChangeWorker] Rating change worker started.");
