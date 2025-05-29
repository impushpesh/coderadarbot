import chalk from "chalk";
import User  from "../models/user.model.js";

import { getCodeforceUserInfo, getCodeforceRatingHistory } from "../services/index.js";

import {generateRatingChartCodeforces} from "../utils/codeforcechartGenerator.js"

export const codeforceCommands = (bot) => {
    // /codeforce - Get Codeforces user info
    bot.command("codeforce", async (ctx) => {
      try {
        console.log(
          chalk.cyan(
            `[COMMAND] /codeforce triggered by id:  ${ctx.from.id} and username: ${
              ctx.from.username || "N/A"
            }`
          )
        );
    
        const user = await User.findOne({ telegramId: ctx.from.id });
    
        if (!user || !user.codeforcesId) {
          console.log(
            chalk.yellow("[WARN] Codeforces user not found or ID not set.")
          );
          return ctx.reply(
            "Please set up your Codeforces username using /setup command."
          );
        }
    
        const userInfo = await getCodeforceUserInfo(user.codeforcesId);
    
        if (!userInfo) {
          console.log(
            chalk.red("[ERROR] Failed to fetch user info from Codeforces.")
          );
          return ctx.reply(
            "Failed to fetch Codeforces user info. Please check your username from /info command."
          );
        }
    
        const {
          handle,
          firstName,
          lastName,
          country,
          rating,
          maxRating,
          rank,
          maxRank,
          titlePhoto,
        } = userInfo;
    
        const name = `${firstName || ""} ${lastName || ""}`.trim();
    
        const message = `Handle: ${handle}
    Name: ${name || "N/A"}
    Country: ${country || "N/A"}
    Rating: ${rating || "N/A"}
    Max Rating: ${maxRating || "N/A"}
    Rank: ${rank || "N/A"}
    Max Rank: ${maxRank || "N/A"}`;
    
        await ctx.replyWithPhoto({ url: titlePhoto }, { caption: message });
    
        console.log(
          chalk.green(
            `[SUCCESS] Codeforces info sent for id:  ${ctx.from.id} and username: ${
              ctx.from.username || "N/A"
            }`
          )
        );
      } catch (error) {
        console.error(chalk.red("[FATAL] Error in /codeforce command:"), error);
        ctx.reply(
          "Oops! Something went wrong while fetching your Codeforces info."
        );
      }
    });

    // /codeforce-rating - Get Codeforces user rating
    bot.command("codeforceRating", async (ctx) => {
      try {
        console.log(
          chalk.cyan(
            `[COMMAND] /codeforceRating triggered by id:  ${
              ctx.from.id
            } and username: ${ctx.from.username || "N/A"}`
          )
        );
    
        const user = await User.findOne({ telegramId: ctx.from.id });
        if (!user || !user.codeforcesId) {
          console.log(
            chalk.yellow("[WARN] User not found or Codeforces ID not set.")
          );
          return ctx.reply(
            "Please set up your Codeforces username using /setup command."
          );
        }
    
        const ratingHistory = await getCodeforceRatingHistory(user.codeforcesId);
    
        if (!ratingHistory || ratingHistory.length < 2) {
          console.log(chalk.yellow("[INFO] Not enough rating history data."));
          return ctx.reply("Not enough contest data to show rating changes.");
        }
    
        const latest = ratingHistory[ratingHistory.length - 1];
        const previous = ratingHistory[ratingHistory.length - 2];
    
        const currentRating = latest.newRating;
        const previousRating = previous.newRating;
        const ratingChange = currentRating - previousRating;
        const sign = ratingChange >= 0 ? "+" : "-";
    
        const message = `Current Rating: ${currentRating}
    Previous Rating: ${previousRating}
    Rating Change: ${sign}${Math.abs(ratingChange)}`;
    
        const chartBuffer = await generateRatingChartCodeforces(ratingHistory);
    
        await ctx.replyWithPhoto(
          { source: chartBuffer },
          { caption: message }
        );
    
        console.log(
          chalk.green(
            `[SUCCESS] Rating change + chart sent for id:  ${ctx.from.id} and username: ${
              ctx.from.username || "N/A"
            }`
          )
        );
      } catch (error) {
        console.error(
          chalk.red("[FATAL] Error in /codeforceRating command:"),
          error
        );
        ctx.reply("Oops! Something went wrong while fetching your Codeforces info.");
      }
    });
}
