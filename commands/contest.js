import chalk from "chalk";
import { format } from "date-fns";
import User from "../models/user.model.js";

import {getUpcomingCodeforcesContests, getCodeforceRatingHistory, getCodeChefUserInfo, getLeetCodeRatingInfo} from "../services/index.js"

export const contestCommands = (bot) => {
  // /contest - Get Upcoming contest list
  bot.command("contest", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /contest triggered by id: ${ctx.from.id} and username: ${
            ctx.from.username || "N/A"
          }`
        )
      );

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

      console.log(
        chalk.green(
          `[SUCCESS] Sent upcoming contests for id: ${ctx.from.id} (${
            ctx.from.username || "N/A"
          })`
        )
      );
    } catch (error) {
      console.error(chalk.red("[FATAL] Error in /contest command:"), error);
      ctx.reply("Oops! Couldn't fetch contest list from Codeforces.");
    }
  });

  // /status - Get your status(Rating) in all platforms
  bot.command("status", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /status triggered by id:  ${ctx.from.id} and username: ${
            ctx.from.username || "N/A"
          }`
        )
      );

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user) {
        console.log(chalk.yellow("[WARN] User not found in database."));
        return ctx.reply(
          "No profile found. Please register your handles first:\n Use: /start"
        );
      }

      const { codeforcesId, codechefId, leetcodeId } = user;

      if (!codeforcesId && !codechefId && !leetcodeId) {
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

      if (codechefId) {
        const ccRating = await getCodeChefUserInfo(codechefId);
        if (ccRating && ccRating.ratingData && ccRating.ratingData.length > 0) {
          const latest = ccRating.ratingData[ccRating.ratingData.length - 1];
          message += `<b>CodeChef:</b> ${latest.rating}\n`;
        } else {
          message += "<b>CodeChef:</b> Not available\n";
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
      console.log(
        chalk.green(`[SUCCESS] Status sent for Telegram ID: ${ctx.from.id}`)
      );
    } catch (error) {
      console.error(chalk.red("[FATAL] Error in /status command:"), error);
      ctx.reply("Oops! Something went wrong while fetching your status.");
    }
  });
};
