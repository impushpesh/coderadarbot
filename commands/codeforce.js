import chalk from "chalk";
import User from "../models/user.model.js";
import UserData from "../models/userData.model.js";
import codeforcesProfileModel from "../models/codeforceProfile.model.js";

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

      //  find the UserData document for this Telegram‐User
      let userData = await UserData.findOne({ telegramID: user._id });

      // Find an existing CodeforcesProfile by handle
      const cfHandle = user.codeforcesId;
      let profileDoc = await codeforcesProfileModel.findOne({ handle: cfHandle });
      
      // There can be two cases:-
      // 1. user is using a new telegram account and have provided codeforceid that already exists in the codeforcesProfileModel and codeforce in userData model is null as it is a new telegram account
      // 2. user is using an old telegram account and have provided codeforceid that already exists in the codeforcesProfileModel

      // If UserData exists but has no linked CF profile, or if UserData doesn’t exist at all:
      if (!userData || !userData.codeforces) {
        // If no profileDoc yet, fetch from API and create one
        if (!profileDoc) {
          console.log(chalk.blue("[INFO] No existing CF profile found. Fetching from API..."));
          const apiData = await getCodeforceUserInfo(cfHandle);

          if (!apiData) {
            console.log(chalk.red("[ERROR] Failed to fetch Codeforces data from API."));
            return ctx.reply("Failed to fetch Codeforces user info. Please check your username with /info.");
          }

          // Create a new CodeforcesProfile document
          profileDoc = await codeforcesProfileModel.create(apiData);
          console.log(chalk.green("[INFO] Created new CodeforcesProfile in DB."));
        } else {
          console.log(chalk.green("[CACHE HIT] Found existing CodeforcesProfile in DB."));
        }

        // Now link that profileDoc._id to UserData
        if (userData) {
          userData.codeforces = profileDoc._id;
          await userData.save();
          console.log(chalk.green("[INFO] Linked existing CF profile to UserData."));
        } else {
          // If UserData didn’t exist at all, create it with codeforces = profileDoc._id
          userData = await UserData.create({
            telegramID: user._id,
            codeforces: profileDoc._id,
          });
          console.log(chalk.green("[INFO] Created new UserData and linked CF profile."));
        }
      } else {
        // userData exists AND userData.codeforces is already set
        // Re‐fetch the profileDoc from the ObjectId stored in userData.codeforces
        profileDoc = await codeforcesProfileModel.findById(userData.codeforces);
        if (!profileDoc) {
          // (Edge case) If somehow the referenced CF document was deleted, fall back to “not linked” logic
          console.log(chalk.yellow("[WARN] userData.codeforces pointed to a missing profile. Re-creating/linking..."));
          const apiData = await getCodeforceUserInfo(cfHandle);
          if (!apiData) {
            return ctx.reply("Failed to re-fetch Codeforces info. Please check your username.");
          }
          // findOneAndUpdate with upsert to ensure we have a profileDoc
          profileDoc = await codeforcesProfileModel.findOneAndUpdate(
            { handle: cfHandle },
            apiData,
            { upsert: true, new: true }
          );
          userData.codeforces = profileDoc._id;
          await userData.save();
          console.log(chalk.green("[INFO] Re-linked or re-created missing CF profile."));
        } else {
          console.log(chalk.green("[CACHE HIT] Using saved CodeforcesProfile from UserData."));
        }
      }
      
      // Checking the timestamp to see if the profileDoc is outdated (more than 24 hrs)
      if(profileDoc){
        const now = Date.now();
        const lastUpdate = new Date(profileDoc.updatedAt).getTime();
        const oneDayMs  = 24 * 60 * 60 * 1000;

        if(now-lastUpdate > oneDayMs){
          console.log(chalk.blue("[INFO] Cached CF profile is older than 24h. Refetching..."));
          const apiData = await getCodeforceUserInfo(cfHandle);
          if(apiData){
            await codeforcesProfileModel.findByIdAndUpdate(
              profileDoc._id,
              {...apiData},
              { new: true, runValidators: true }
            );
            profileDoc = await codeforcesProfileModel.findById(profileDoc._id);
            console.log(chalk.green("[INFO] CodeforcesProfile refreshed and saved."));

          }else{
            console.log(chalk.red("[ERROR] Failed to fetch updated Codeforces data from API."));
          }
        }else{
          console.log(chalk.green("[CACHE HIT] CF profile is fresh (<24h)."));
        }
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
      } = profileDoc;

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
