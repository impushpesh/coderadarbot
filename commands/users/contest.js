import logger from "../../logger/logger.js";
import { format } from "date-fns";
import User from "../../models/user.model.js";
import UpcomingContest from "../../models/upcomingContest.model.js";

import codeforcesProfileModel from "../../models/codeforceProfile.model.js";
import LeetcodeProfileModel from "../../models/leetcodeProfile.model.js";
import codechefProfileModel from "../../models/codechefProfile.model.js";

import { isBanned } from "../../middleware/isBanned.js";

export const contestCommands = (bot) => {
  // /contest - Get Upcoming contest list
  bot.command("contest", isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [contestCommands] /contest triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const contests = await  UpcomingContest.find({ platform: "codeforces" }).sort({ startTime: 1 }).limit(3);

      if (!contests || contests.length === 0) {
        return ctx.reply("No upcoming contests found.");
      }

      let message = ` <b>Upcoming Codeforces Contests</b>\n\n`;

      contests.forEach((contest, index) => {
        const startDate = new Date(contest.startTimeSeconds * 1000);
        const durationMins = contest.durationSeconds / 60;
        message += `<b>${index + 1}. ${contest.name}</b>\n Duration: ${
          durationMins >= 60
            ? `${durationMins / 60} hrs`
            : `${durationMins} mins`
        }\n <b>Starts: </b> ${format(startDate, "PPPppp")}\n\n`;
      });

      await ctx.reply(message.trim(), { parse_mode: "HTML" });

      logger.info(`[RE_SUCCESS] [contestCommands] Contest list sent for Telegram ID: ${ctx.from.id}`);
    } catch (error) {
      logger.error(`[COMMANDS] [contestCommands] Error in /contest command:`, error);
      ctx.reply("Error in contest command. Please try again later.");
    }
  });

  // /status - Get your status(Rating) in all platforms
  bot.command("status", isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [contestCommands] /status triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user) {
        logger.warn(`[ID_NOT_SET] [contestCommands] User not found in database for id: ${ctx.from.id}`);
        return ctx.reply(
          "No profile found. Please register your handles first:\n Use: /setup"
        );
      }

      const { codeforcesId, leetcodeId, codechefId } = user;

      if (!codeforcesId && !leetcodeId && !codechefId) {
        return ctx.reply("You have not set up any platform handles yet.\n Use: /setup");
      }

      let message = "<b>Your current ratings:</b>\n";

      if (codeforcesId) {
        const cfRating = await codeforcesProfileModel.findOne({ handle: codeforcesId });
        if (cfRating) {
          const latest = cfRating.rating;
          message += `<b>Codeforces:</b> ${latest}\n`;
        } else {
          message += "<b>Codeforces:</b> Not available\n";
        }
      }

      if (leetcodeId) {
        const lcRating = await LeetcodeProfileModel.findOne({ username: leetcodeId });
        if (lcRating) {
          message += `<b>LeetCode:</b> ${lcRating.rating}\n`;
        } else {
          message += "<b>LeetCode:</b> Not available\n";
        }
      }

      if (codechefId) {
        const ccRating = await codechefProfileModel.findOne({ handle: codechefId });
        if (ccRating) {
          message += `<b>CodeChef:</b> ${ccRating.currentRating}\n`;
        } else {
          message += "<b>CodeChef:</b> Not available\n";
        }
      }

      await ctx.reply(message.trim(), { parse_mode: "HTML" });
      logger.info(`[RE_SUCCESS] [contestCommands] Status sent for id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    } catch (error) {
      logger.error(`[COMMANDS] [contestCommands] Error in /status command:`, error);
      ctx.reply("Error in status command. Please try again later.");
    }
  });
};