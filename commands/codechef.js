import chalk from "chalk";
import User from "../models/user.model.js";

import { getCodeChefUserInfo } from "../services/index.js";

export const codechefCommands = (bot) => {
  // /codechefRating - Get CodeChef user rating
  bot.command("codechefRating", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /codechefRating triggered by id:  ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
        )
      );

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user || !user.codechefId) {
        console.log(
          chalk.yellow("[WARN] User not found or CodeChef ID not set.")
        );
        return ctx.reply(
          "Please set up your CodeChef username using /setup command."
        );
      }

      const userInfo = await getCodeChefUserInfo(user.codechefId);

      if (!userInfo || !userInfo.ratingData || userInfo.ratingData.length < 2) {
        console.log(chalk.yellow("[INFO] Not enough rating history data."));
        return ctx.reply("Not enough contest data to show rating changes.");
      }

      const ratingHistory = userInfo.ratingData;
      const latest = ratingHistory[ratingHistory.length - 1];
      const previous = ratingHistory[ratingHistory.length - 2];

      const currentRating = parseInt(latest.rating, 10);
      const previousRating = parseInt(previous.rating, 10);
      const ratingChange = currentRating - previousRating;
      const sign = ratingChange >= 0 ? "+" : "-";

      const message = `Current Rating: ${currentRating}
    Previous Rating: ${previousRating}
    Rating Change: ${sign}${Math.abs(ratingChange)}`;

      await ctx.reply(message);
      console.log(
        chalk.green(
          `[SUCCESS] CodeChef rating change sent for id:  ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
        )
      );
    } catch (error) {
      console.error(
        chalk.red("[FATAL] Error in /codechefRating command:"),
        error
      );
      ctx.reply(
        "Oops! Something went wrong while fetching your CodeChef info."
      );
    }
  });

  // /codechef - Get CodeChef user info
  bot.command("codechef", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /codechef triggered by id:  ${ctx.from.id} and username: ${
            ctx.from.username || "N/A"
          }`
        )
      );

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user || !user.codechefId) {
        console.log(
          chalk.yellow("[WARN] User not found or CodeChef ID not set.")
        );
        return ctx.reply(
          "Please set up your CodeChef username using /setup command."
        );
      }

      const userInfo = await getCodeChefUserInfo(user.codechefId);

      if (!userInfo) {
        console.log(chalk.red("[ERROR] Failed to fetch CodeChef user info."));
        return ctx.reply(
          "Failed to fetch codechef user info. Please check your username. from /info command."
        );
      }

      const {
        profile,
        name,
        currentRating,
        highestRating,
        globalRank,
        countryRank,
        countryName,
        stars,
      } = userInfo;

      const message = `
Name: ${name || "N/A"}
Country: ${countryName || "N/A"}
Rating: ${currentRating || "N/A"}
Max Rating: ${highestRating || "N/A"}
Global Rank: ${globalRank || "N/A"}
Country Rank: ${countryRank || "N/A"}
Stars: ${stars || "N/A"}`;

      await ctx.replyWithPhoto({ url: profile }, { caption: message });
      console.log(
        chalk.green(
          `[SUCCESS] CodeChef user info sent for id:  ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
        )
      );
    } catch (error) {
      console.error(chalk.red("[FATAL] Error in /codechef command:"), error);
      ctx.reply(
        "Oops! Something went wrong while fetching your CodeChef info."
      );
    }
  });
};
