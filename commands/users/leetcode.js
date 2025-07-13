import logger from "../../logger/logger.js";
import User from "../../models/user.model.js";
import UserData from "../../models/userData.model.js";
import LeetcodeProfileModel from "../../models/leetcodeProfile.model.js";

import {
  getLeetCodePublicProfile,
  getLeetCodeRatingInfo,
} from "../../services/index.js";

import { generateLeetCodeChart } from "../../utils/leetcodeChartGenerator.js";
import { isBanned } from "../../middleware/isBanned.js";

export const leetcodeCommands = (bot) => {
  // /leetcode - Get LeetCode user Info
  //TODO: Add code to save rating also inside the DB
  bot.command("leetcode", isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [leetcodeCommands] /leetcode triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
  
      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user || !user.leetcodeId) {
        logger.warn(`[ID_NOT_SET] [leetcodeCommands] User not found or LeetCode ID not set for id: ${ctx.from.id}`);
        return ctx.reply(
          "Please set up your LeetCode username using /setup command."
        );
      }

      let userData = await UserData.findOne({ telegramID: user._id });

      const lcHandle = user.leetcodeId;
      let profileDoc = await LeetcodeProfileModel.findOne({ username: lcHandle });

      if (!userData || !userData.leetcode) {
        // If no profileDoc yet, fetch from API and create one
        if (!profileDoc) {
          logger.info(`[CACHE MISS] [leetcodeCommands] No existing LeetcodeProfile found for handle: ${lcHandle}. Fetching from API...`);
          const apiData = await getLeetCodePublicProfile(lcHandle);

          if (!apiData) {
            logger.error(`[API_ERROR] [leetcodeCommands] Failed to fetch LeetCode data from API for handle: ${lcHandle}.`);
            return ctx.reply(
              "Failed to fetch LeetCode user info. Please check your username with /info."
            );
          }
          const ratingInfo = await getLeetCodeRatingInfo(lcHandle);
          const history = ratingInfo.history.filter((entry) => entry.attended);
          const latest = history[history.length - 1];
          apiData.rating = latest ? latest.rating : null; // Add rating to the profile data

          profileDoc = await LeetcodeProfileModel.create(apiData);
          logger.info(`[CREATION] [leetcodeCommands] Created new LeetcodeProfile in DB for handle: ${lcHandle}`);
        } else {
          logger.info(`[CACHE HIT] [leetcodeCommands] Found existing LeetcodeProfile in DB for handle: ${lcHandle}`);
        }

        if (userData) {
          userData.leetcode = profileDoc._id;
          await userData.save();
          logger.info(`[UPDATION] [leetcodeCommands] Linked existing UserData with new Leetcode profile for user: ${user._id}`);
        } else {
          userData = await UserData.create({
            telegramID: user._id,
            leetcode: profileDoc._id,
          });
          logger.info(`[CREATION] [leetcodeCommands] Created new UserData document for user: ${user._id}`);
        }
      } else {
        // userData exists AND userData.leetcode is already set
        profileDoc = await LeetcodeProfileModel.findById(userData.leetcode);

        if (!profileDoc) {
          logger.warn(`[MISSING] [leetcodeCommands] userData.leetcode pointed to a missing profile. Re-creating/linking...`);

          const apiData = await getLeetCodePublicProfile(lcHandle);

          if (!apiData) {
            logger.error(`[API_ERROR] [leetcodeCommands] Failed to fetch LeetCode data from API for handle: ${lcHandle}.`);
            return ctx.reply(
              "Failed to re-fetch LeetCode info. Please check your username."
            );
          }

          const ratingInfo = await getLeetCodeRatingInfo(lcHandle);
          const history = ratingInfo.history.filter((entry) => entry.attended);
          const latest = history[history.length - 1];
          apiData.rating = latest ? latest.rating : null; // Add rating to the profile data

          profileDoc = await LeetcodeProfileModel.findOneAndUpdate(
            { username: lcHandle },
            apiData,
            { upsert: true, new: true }
          );

          userData.leetcode = profileDoc._id;
          await userData.save();

          logger.info(`[UPDATION] [leetcodeCommands] Re-linked UserData with new Leetcode profile for user: ${user._id}`);
        } else {
          logger.info(`[CACHE HIT] [leetcodeCommands] Using saved LeetcodeProfile from UserData.`);
        }
      }

      // Checking the timestamp to see if the profileDoc is outdated (more than 24 hrs)
      if(profileDoc){
        const now = Date.now();
        const lastUpdate = new Date(profileDoc.updatedAt).getTime();
        const oneDayMs  =  24 * 60 * 60 * 1000;

        if(now-lastUpdate > oneDayMs){
          logger.info(`[CACHE MISS] [leetcodeCommands] Leetcode profile is outdated (>24 hrs). Fetching fresh data...`);
          const apiData = await getLeetCodePublicProfile(lcHandle);
          const ratingInfo = await getLeetCodeRatingInfo(lcHandle);
          const history = ratingInfo.history.filter((entry) => entry.attended);
          const latest = history[history.length - 1];
          apiData.rating = latest ? latest.rating : null; // Add rating to the profile data
          if (apiData) {
            profileDoc = await LeetcodeProfileModel.findByIdAndUpdate(
              profileDoc._id,
              {...apiData},
              { new: true, runValidators: true }
            );
            profileDoc = await LeetcodeProfileModel.findById(profileDoc._id);
            logger.info(`[UPDATION] [leetcodeCommands] LeetcodeProfile refreshed and saved for handle: ${lcHandle}`);
          }else{
            logger.error(`[API_ERROR] [leetcodeCommands] Failed to fetch updated LeetCode data from API for handle: ${lcHandle}.`);
          }
          
          
        }else{
          logger.info(`[CACHE HIT] [leetcodeCommands] Leetcode profile is fresh (<4 days).`);

        }
      }

      const { badge, avatar, rating, ranking, country, linkedin, github, twitter } =
        profileDoc;

      const message = `
    <b>LeetCode ID:</b> ${user.leetcodeId}
    <b>Rating:</b> ${rating || "N/A"}
    <b>Ranking:</b> ${ranking || "N/A"}
    <b>Country:</b> ${country || "N/A"}
    <b>Badge:</b> ${badge || "N/A"}
    
    Social Links:
    ${twitter ? ` Twitter: ${twitter}` : ""}
    ${github ? ` GitHub: ${github}` : ""}
    ${linkedin ? ` LinkedIn: ${linkedin}` : ""}
        `.trim();

      await ctx.replyWithPhoto(
        { url: avatar },
        { caption: message, parse_mode: "HTML" }
      );
      logger.info(`[RE_SUCCESS] [leetcodeCommands] Leetcode info sent for id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    } catch (error) {
      logger.error(`[COMMANDS] [leetcodeCommands] Error in /leetcode command: ${error}`);
      ctx.reply(
        "Error in LeetCode command. Please try again later or check your username with /info."
      );
    }
  });

  // /leetcodeRating - Get LeetCode user rating
  bot.command("leetcoderatinggraph", isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [leetcodeCommands] /leetcoderatinggraph triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user || !user.leetcodeId) {
        logger.warn(`[ID_NOT_SET] [leetcodeCommands] LeetCode ID not found for id: ${ctx.from.id}`);
        return ctx.reply(
          "Please set up your LeetCode username using /setup command."
        );
      }

      const userInfo = await getLeetCodeRatingInfo(user.leetcodeId);

      if (!userInfo || !userInfo.history || userInfo.history.length === 0) {
        logger.warn(`[API_ERROR] [leetcodeCommands] Failed to fetch LeetCode rating info for id: ${ctx.from.id}`);
        return ctx.reply("Could not fetch your LeetCode contest data.");
      }

      const { attendedContestsCount, rating } = userInfo;
      const history = userInfo.history.filter((entry) => entry.attended);

      if (history.length < 2) {
        logger.warn(`[DATA_ERROR] [leetcodeCommands] Not enough attended contests for id: ${ctx.from.id}`);
        return ctx.reply(
          "Not enough attended contests to generate rating chart."
        );
      }

      const latest = history[history.length - 1];
      const previous = history[history.length - 2];

      const ratingChange = (latest.rating - previous.rating).toFixed(2);
      const rankingChange = latest.ranking - previous.ranking;
      const ratingSign = ratingChange >= 0 ? "+" : "";
      const rankingSign = rankingChange <= 0 ? "+" : "-";

      const chartBuffer = await generateLeetCodeChart(userInfo.history);

      const message = `📊 <b>LeetCode Contest Stats:</b>
    • Attended Contests: ${attendedContestsCount}
    • <b>Current Rating:</b> ⭐ ${rating.toFixed(2)}
    • Previous Rating: ${previous.rating.toFixed(2)}
    • <b>Rating Change:</b> ${ratingSign}${ratingChange} ${
        ratingChange >= 0 ? "🔼" : "🔽"
      }
    • Current Rank: 🏅 ${latest.ranking}
    • Previous Rank: ${previous.ranking}
    • Rank Change: ${rankingSign}${Math.abs(rankingChange)} ${
        rankingChange <= 0 ? "🔼" : "🔽"
      }`;

      await ctx.replyWithPhoto(
        { source: chartBuffer },
        { caption: message, parse_mode: "HTML" }
      );

      logger.info(`[RE_SUCCESS] [leetcodeCommands] Leetcode rating info sent for id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    } catch (error) {
      logger.error(`[COMMANDS] [leetcodeCommands] Error in /leetcoderatinggraph command:`, error);
      ctx.reply(
        "Error in LeetCode command. Please try again later or check your username with /info."
      );
    }
  });
};
