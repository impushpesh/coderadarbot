import logger from "../../logger/logger.js";
import { format } from "date-fns";
import User from "../../models/user.model.js";

import {getUpcomingCodeforcesContests, getCodeforceRatingHistory, getCodeChefUserInfo, getLeetCodeRatingInfo} from "../../services/index.js"

export const contestCommands = (bot) => {
  // /contest - Get Upcoming contest list
  bot.command("contest", async (ctx) => {
    try {
      logger.info(`[COMMAND] [contestCommands] /contest triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const contests = await getUpcomingCodeforcesContests();

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
  bot.command("status", async (ctx) => {
    try {
      logger.info(`[COMMAND] [contestCommands] /status triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user) {
        logger.warn(`[ID_NOT_SET] [contestCommands] User not found in database for id: ${ctx.from.id}`);
        return ctx.reply(
          "No profile found. Please register your handles first:\n Use: /setup"
        );
      }

      const { codeforcesId, leetcodeId } = user;

      if (!codeforcesId && !leetcodeId) {
        return ctx.reply("You have not set up any platform handles yet.\n Use: /setup");
      }

      let message = "<b>Your current ratings:</b>\n";

      if (codeforcesId) {
        const cfRating = await getCodeforceRatingHistory(codeforcesId);
        if (cfRating && cfRating.length > 0) {
          const latest = cfRating[cfRating.length - 1];
          message += `<b>Codeforces:</b> ${latest.newRating}\n`;
        } else {
          message += "<b>Codeforces:</b> Not available\n";
        }
      }

      if (leetcodeId) {
        const lcRating = await getLeetCodeRatingInfo(leetcodeId);
        if (lcRating) {
          message += `<b>LeetCode:</b> ${lcRating.rating}\n`;
        } else {
          message += "<b>LeetCode:</b> Not available\n";
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
