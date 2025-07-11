import logger from "../../logger/logger.js";
import User from "../../models/user.model.js";
import UserData from "../../models/userData.model.js";
import codeforcesProfileModel from "../../models/codeforceProfile.model.js";

import {
  getCodeforceUserInfo,
  getCodeforceRatingHistory,
} from "../../services/index.js";

import { generateRatingChartCodeforces } from "../../utils/codeforcechartGenerator.js";

export const codeforceCommands = (bot) => {
  // /codeforce - Get Codeforces user info
  bot.command("codeforce", async (ctx) => {
    try {
      logger.info(
        `[COMMAND] [codeforceCommands] /codeforce triggered by id: ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      );

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user || !user.codeforcesId) {
        logger.warn(`[ID_NOT_SET] [codeforceCommands] User not found or codeforce ID not set for id: ${ctx.from.id}`);
        return ctx.reply(
          "Please set up your Codeforces username using /setup command."
        );
      }

      //  find the UserData document for this Telegram‐User
      let userData = await UserData.findOne({ telegramID: user._id });

      // Find an existing CodeforcesProfile by handle
      const cfHandle = user.codeforcesId;
      let profileDoc = await codeforcesProfileModel.findOne({
        handle: cfHandle,
      });

      // There can be two cases:-
      // 1. user is using a new telegram account and have provided codeforceid that already exists in the codeforcesProfileModel and codeforce in userData model is null as it is a new telegram account
      // 2. user is using an old telegram account and have provided codeforceid that already exists in the codeforcesProfileModel

      // If UserData exists but has no linked CF profile, or if UserData doesn’t exist at all:
      if (!userData || !userData.codeforces) {
        // If no profileDoc yet, fetch from API and create one
        if (!profileDoc) {
          logger.info(`[CACHE MISS] [codeforceCommands] No existing CodeforceProfile found for handle: ${cfHandle}. Fetching from API...`);
          const apiData = await getCodeforceUserInfo(cfHandle);

          if (!apiData) {
            logger.error(`[API_ERROR] [codeforceCommands] Failed to fetch Codeforce data from API for handle: ${cfHandle}`);
            return ctx.reply(
              "Failed to fetch Codeforces user info. Please check your username with /info."
            );
          }

          // Create a new CodeforcesProfile document
          profileDoc = await codeforcesProfileModel.create(apiData);
          logger.info(`[CREATION] [codeforceCommands] Created new CodeforceProfile in DB for handle: ${cfHandle}`);
        } else {
          logger.info(`[CACHE HIT] [codeforceCommands] Found existing CodeforceProfile in DB for handle: ${cfHandle}`);
        }

        // Now link that profileDoc._id to UserData
        if (userData) {
          userData.codeforces = profileDoc._id;
          await userData.save();
          logger.info(`[UPDATION] [codeforceCommands] Linked existing UserData with new Codeforce profile for user: ${user._id}`);
        } else {
          // If UserData didn’t exist at all, create it with codeforces = profileDoc._id
          userData = await UserData.create({
            telegramID: user._id,
            codeforces: profileDoc._id,
          });
          logger.info(`[CREATION] [codeforceCommands] Created new UserData document for user: ${user._id}`);
        }
      } else {
        // userData exists AND userData.codeforces is already set
        // Re‐fetch the profileDoc from the ObjectId stored in userData.codeforces
        profileDoc = await codeforcesProfileModel.findById(userData.codeforces);
        if (!profileDoc) {
          // (Edge case) If somehow the referenced CF document was deleted, fall back to “not linked” logic
          logger.warn(`[MISSING] [codeforceCommands] userData.codeforce pointed to a missing profile. Re-creating/linking...`);
          const apiData = await getCodeforceUserInfo(cfHandle);
          if (!apiData) {
            logger.error(`[API_ERROR] [codeforceCommands] Failed to fetch Codeforce data from API for handle: ${cfHandle}`);
            return ctx.reply(
              "Failed to re-fetch Codeforces info. Please check your username."
            );
          }
          // findOneAndUpdate with upsert to ensure we have a profileDoc
          profileDoc = await codeforcesProfileModel.findOneAndUpdate(
            { handle: cfHandle },
            apiData,
            { upsert: true, new: true }
          );
          userData.codeforces = profileDoc._id;
          await userData.save();
          logger.info(`[UPDATION] [codeforceCommands] Re-linked UserData with new Codeforces profile for user: ${user._id}`);
        } else {
          logger.info(`[CACHE HIT] [codeforceCommands] Using saved CodeforcesProfile from UserData.`);
  
        }
      }

      // Checking the timestamp to see if the profileDoc is outdated (more than 24 hrs)
      if (profileDoc) {
        const now = Date.now();
        const lastUpdate = new Date(profileDoc.updatedAt).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (now - lastUpdate > oneDayMs) {
          logger.info(`[CACHE MISS] [codeforceCommands] Codeforce profile is outdated (>4 days). Fetching fresh data...`);
          const apiData = await getCodeforceUserInfo(cfHandle);
          if (apiData) {
            await codeforcesProfileModel.findByIdAndUpdate(
              profileDoc._id,
              { ...apiData },
              { new: true, runValidators: true }
            );
            profileDoc = await codeforcesProfileModel.findById(profileDoc._id);
            logger.info(`[UPDATION] [codeforceCommands] CodeforcesProfile refreshed and saved for handle: ${cfHandle}`);
          } else {
            logger.error(`[API_ERROR] [codeforceCommands] Failed to fetch updated Codeforces data from API for handle: ${cfHandle}`);
          }
        } else {
          logger.info(`[CACHE HIT] [codeforceCommands] Codeforces profile is fresh (<24h).`);
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

      logger.info(`[RE_SUCCESS] [codeforcesCommands] Codeforces info sent for id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    } catch (error) {
      logger.error(`[FATAL] [codeforcesCommands] Error in /codeforces command:`, error);
      ctx.reply(
        "Error in codeforce command"
      );
    }
  });

  // /codeforce-rating - Get Codeforces user rating
  bot.command("codeforceRating", async (ctx) => {
    try {
      logger.info(`[COMMAND] [codeforcesCommands] /codeforcesRating triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user || !user.codeforcesId) {
        logger.warn(`[ID_NOT_SET] [codeforcesCommands] User not found or Codeforces ID not set for id: ${ctx.from.id}`);
        return ctx.reply(
          "Please set up your Codeforces username using /setup command."
        );
      }

      const ratingHistory = await getCodeforceRatingHistory(user.codeforcesId);

      if (!ratingHistory || ratingHistory.length < 2) {
        logger.warn(`[DATA_ERROR] [codeforcesCommands] Not enough contest data to show rating changes for id: ${ctx.from.id}`);
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

      logger.info(`[RE_SUCCESS] [codeforcesCommands] Codeforces rating info sent for id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    } catch (error) {
      logger.error(`[FATAL] [codeforcesCommands] Error in /codeforcesRating command:`, error);
      ctx.reply(
        "Error in codeforce rating command"
      );
    }
  });
};
