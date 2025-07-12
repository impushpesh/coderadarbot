// Codeforce rating change job definition- detects change and update db

import logger from "../../logger/logger.js";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

import User from "../../models/user.model.js";
import codeforcesProfileModel from "../../models/codeforceProfile.model.js";
import { getCodeforceUserInfo } from "../../services/codeforce.api.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

export function defineCodeforceRatingChange(agenda) {
  agenda.define("codeforce:ratingChange", async (job) => {
    // check the current rating of users from db, and the previous rating of the user, if its different, then update the user data
    // and ping that particular user after successful updation
    try {
      logger.info("[JOB_SUCCESS] [defineCodeforceRatingChange] Rating change job started for codeforce");

      const users = await User.find({}, "telegramId codeforcesId");

      for (const user of users) {
        if (!user.codeforcesId) continue;
        const userInfo = await getCodeforceUserInfo(user.codeforcesId); // ! Implement timeout to prevent abuse.
        if (!userInfo) {
          logger.warn(`[JOB_WARN] [defineCodeforceRatingChange] No Codeforces user info found for user: ${user.telegramId}`);
          continue;
        }

        // Check if the rating has changed
        const userFromDB = await codeforcesProfileModel.findOne({ handle: userInfo.handle });

        if (userInfo.rating !== userFromDB.rating) {
          logger.debug(`Rating changed for user: ${user.telegramId}. Old Rating: ${userFromDB.rating}, New Rating: ${userInfo.rating}`);
          // Update the user's data in the database- rating, max rating, rank, max rank
          userFromDB.rating = userInfo.rating;
          userFromDB.maxRating = userInfo.maxRating;
          userFromDB.rank = userInfo.rank;
          userFromDB.maxRank = userInfo.maxRank;
          await userFromDB.save();

          // Send a notification to the user
          await bot.telegram.sendMessage(user.telegramId, `Your Codeforces rating has been updated to ${userInfo.rating}.`, { parse_mode: "HTML" });
          logger.info(`[JOB_SUCCESS] [defineCodeforceRatingChange] Notified user ${user.telegramId} about rating change.`);
        }
      }
      logger.info("[JOB_SUCCESS] [defineCodeforceRatingChange] Codeforces rating check job finished successfully.");
    } catch (error) {
      logger.error("[JOB_ERROR] [defineCodeforceRatingChange] Failed to check Codeforces rating change from codeforce rating change job", error);
    } 
  });
}
