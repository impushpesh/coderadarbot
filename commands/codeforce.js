import chalk from "chalk";
import User from "../models/user.model.js";
import UserData from "../models/userData.model.js";

import {
  getCodeforceUserInfo,
  getCodeforceRatingHistory,
} from "../services/index.js";

import { generateRatingChartCodeforces } from "../utils/codeforcechartGenerator.js";

export const codeforceCommands = (bot) => {
  // /codeforce - Get Codeforces user info
  bot.command("codeforce", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /codeforce triggered by id:  ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
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

      let userDatafromdb = await UserData.findOne({ telegramID: user._id });

      let codeforcesProfile = userDatafromdb?.codeforces;

      if (!codeforcesProfile) {
        console.log(chalk.blue("[INFO] Fetching Codeforces data from API..."));
        const apiData = await getCodeforceUserInfo(user.codeforcesId);

        if (!apiData) {
          console.log(
            chalk.red("[ERROR] Failed to fetch Codeforces data from API.")
          );
          return ctx.reply(
            "Failed to fetch Codeforces user info. Please check your username from /info command."
          );
        }

        codeforcesProfile = apiData;

        if (userDatafromdb) {
          // ✅ Update existing document
          userDatafromdb.codeforces = apiData;
          await userDatafromdb.save();
          console.log(
            chalk.green("[INFO] Updated existing Codeforces profile in DB.")
          );
        } else {
          // ✅ Create new document
          await UserData.create({
            telegramID: user._id,
            codeforces: apiData,
          });
          console.log(
            chalk.green("[INFO] Created new UserData with Codeforces profile.")
          );
        }
      } else {
        console.log(chalk.green("[CACHE HIT] Using saved Codeforces data."));
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
      } = codeforcesProfile;

      const name = `${firstName || ""} ${lastName || ""}`.trim();

      const message = `<b>🤖 Codeforces Handle:</b> ${handle}

    🧑‍💻 Name: ${name || "N/A"}

    🌍 Country: ${country || "N/A"}

    <b>📈 Current Rating:</b> ${rating || "N/A"}

    🏆 Max Rating: ${maxRating || "N/A"}

    <b>🥇 Current Rank:</b> ${rank || "N/A"}

    🥈 Max Rank: ${maxRank || "N/A"}`;

      await ctx.replyWithPhoto(
        { url: titlePhoto },
        { caption: message, parse_mode: "HTML" }
      );

      console.log(
        chalk.green(
          `[SUCCESS] Codeforces info sent for id:  ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
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
          `[COMMAND] /codeforceRating triggered by id: ${
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
      const ratingSign = ratingChange >= 0 ? "+" : "";
      const rankChange = previous.rank - latest.rank;
      const rankingSign = rankChange >= 0 ? "+" : "-";

      //TODO: Generating the chart each time can slow down the bot, so theres should be limit on how many times the user can call this command 
      const chartBuffer = await generateRatingChartCodeforces(ratingHistory);

      const message = `📊 <b>Codeforces Contest Stats:</b>

    • Contest: ${latest.contestName}

    • <b>Current Rating:</b> ⭐ ${currentRating}
    • Previous Rating: ${previousRating}
    • <b>Rating Change:</b> ${ratingSign}${ratingChange} ${
        ratingChange >= 0 ? "🔼" : "🔽"
      }
    • Current Rank: 🏅 ${latest.rank}
    • Previous Rank: ${previous.rank}
    • Rank Change: ${rankingSign}${Math.abs(rankChange)} ${
        rankChange >= 0 ? "🔼" : "🔽"
      }`;

      await ctx.replyWithPhoto(
        { source: chartBuffer },
        { caption: message, parse_mode: "HTML" }
      );

      console.log(
        chalk.green(
          `[SUCCESS] Codeforces rating chart sent for id: ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
        )
      );
    } catch (error) {
      console.error(
        chalk.red("[FATAL] Error in /codeforceRating command:"),
        error
      );
      ctx.reply(
        "Oops! Something went wrong while fetching your Codeforces info."
      );
    }
  });
};
