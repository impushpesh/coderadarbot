// Codeforce rating change job definition- detects change and update db

import chalk from "chalk";
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
      console.log(chalk.blue("[INFO] Starting Codeforces rating change job..."));

      const users = await User.find({}, "telegramId codeforcesId");

      for (const user of users) {
        if (!user.codeforcesId) continue;
        const userInfo = await getCodeforceUserInfo(user.codeforcesId);
        if (!userInfo) {
          console.warn(chalk.yellow(`[WARN] No Codeforces profile found for user: ${user.codeforcesId}`));
          continue;
        }

        // Check if the rating has changed
        const userFromDB = await codeforcesProfileModel.findOne({ handle: userInfo.handle });

        if (userInfo.rating !== userFromDB.rating) {
          console.log(chalk.green("[INFO] Codeforces rating has changed."));
          // Update the user's data in the database- rating, max rating, rank, max rank
          userFromDB.rating = userInfo.rating;
          userFromDB.maxRating = userInfo.maxRating;
          userFromDB.rank = userInfo.rank;
          userFromDB.maxRank = userInfo.maxRank;
          await userFromDB.save();

          // Send a notification to the user
          await bot.telegram.sendMessage(user.telegramId, `Your Codeforces rating has been updated to ${userInfo.rating}.`, { parse_mode: "HTML" });
        }
      }
      console.log(chalk.blue("[INFO] Codeforces rating check job finished."));
    } catch (error) {
      console.error(chalk.red("[ERROR] Failed to check Codeforces rating change:"), error);
    } 
  });
}
