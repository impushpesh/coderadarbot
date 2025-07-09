// Leetcode rating change job definition- detects change and update db
import chalk from "chalk";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

import LeetcodeProfileModel from "../../models/leetcodeProfile.model.js";
import User from "../../models/user.model.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
// ! To implement this i have to modify the leetcode command so that it saves the rating in the database

export function defineLeetcodeRatingChange(agenda) {
  agenda.define("leetcode:ratingChange", async (job) => {
    try {
      console.log(chalk.blue("[INFO] Starting LeetCode rating change job..."));
      // check the current rating of users from db, and the previous rating of the user, if its different, then update the user data
      // and ping that particular user after successful updation
      const users = await User.find({}, "telegramId");

      for (const user of users) {
        
          // Fetch the user's LeetCode profile
          const leetcodeProfile = await LeetcodeProfileModel.findOne({ username: user.username });
          if (!leetcodeProfile) {
            console.warn(chalk.yellow(`[WARN] No LeetCode profile found for user: ${user.username}`));
            continue;
          }
          // Check if the rating has changed
      }
      
    } catch (error) {
      console.error(chalk.red("[ERROR] Failed to check LeetCode rating change:"), error);
    }
  });
}
