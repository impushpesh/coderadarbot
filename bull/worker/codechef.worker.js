// Worker that checks for CodeChef rating changes and notifies users via Telegram.
import { Worker } from "bullmq";
import dotenv from "dotenv";
import logger from "../../logger/logger.js";
import connectDB from "../../lib/connection.js";

import User from "../../models/user.model.js";
import CodechefProfileModel from "../../models/codechefProfile.model.js";
import { getCodeChefUserInfo } from "../../services/codechef.api.js";
import { Telegraf } from "telegraf";
import { redisOptions } from "../producer/codechef.producer.js";

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Connect to MongoDB
await connectDB();
logger.info("[WORKER] [codechefRatingWorker] Connected to MongoDB");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const jobHandlers = {
  trackCodechefRating: async () => {
    logger.info("[WORKER] [codechefRatingWorker] Starting CodeChef rating change job...");

    const users = await User.find({}, "telegramId codechefId");

    for (const user of users) {
      if (!user.codechefId) continue;

      try {
        const userInfo = await getCodeChefUserInfo(user.codechefId);
        const {
          currentRating,
          highestRating,
          globalRank,
          countryRank,
          stars,
          name,
          profile: profilePic
        } = userInfo;

        if (typeof currentRating !== "number") {
          logger.warn(`[WORKER] [codechefRatingWorker] Invalid data for ${user.codechefId}`);
          continue;
        }

        const profile = await CodechefProfileModel.findOne({ handle: user.codechefId });
        if (!profile) {
          logger.warn(`[WORKER] [codechefRatingWorker] No profile in DB for handle ${user.codechefId}`);
          continue;
        }

        if (currentRating !== profile.currentRating) {
          const ratingChange = currentRating - profile.currentRating;

          logger.info(`[WORKER] [codechefRatingWorker] Rating changed for ${user.telegramId}: ${profile.currentRating} → ${currentRating}`);

          profile.currentRating = currentRating;
          profile.highestRating = highestRating ?? profile.highestRating;
          profile.globalRank = globalRank ?? profile.globalRank;
          profile.countryRank = countryRank ?? profile.countryRank;
          profile.stars = stars ?? profile.stars;
          profile.name = name ?? profile.name;
          profile.profile = profilePic ?? profile.profile;

          await profile.save();

          await bot.telegram.sendMessage(
            user.telegramId,
            `<b>CodeChef Rating Updated!</b>\n<b>New Rating:</b> ${currentRating} (${ratingChange >= 0 ? "+" : ""}${ratingChange})\n<b>Global Rank:</b> ${globalRank}\n<b>Country Rank:</b> ${countryRank}\n<b>Stars:</b> ${stars}`,
            { parse_mode: "HTML" }
          );
        }
      } catch (error) {
        logger.error(`[WORKER] [codechefRatingWorker] Error processing user ${user.telegramId}: ${error.message}`);
      }

      await sleep(1500); // Sleep to prevent API abuse
    }

    logger.info("[WORKER] [codechefRatingWorker] CodeChef rating change job finished.");
  },
};

// Worker setup
const worker = new Worker(
  "codechefQueue",
  async (job) => {
    logger.info(`[WORKER] [codechefRatingWorker] Processing job: ${job.name}`);
    const handler = jobHandlers[job.name];

    if (!handler) {
      logger.error(`[WORKER] [codechefRatingWorker] No handler for job: ${job.name}`);
      throw new Error(`No handler for job: ${job.name}`);
    }

    await handler(job);
  },
  { connection: redisOptions }
);

// Events
worker.on("completed", (job) => {
  logger.info(`[WORKER] [codechefRatingWorker] Job ${job.name} (${job.id}) completed`);
});

worker.on("failed", (job, err) => {
  logger.error(`[WORKER] [codechefRatingWorker] Job ${job.name} (${job.id}) failed: ${err.message}`);
});

logger.info("[WORKER] [codechefRatingWorker] Worker started.");
