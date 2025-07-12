import logger from "../../logger/logger.js";
import User from "../../models/user.model.js";
import CodechefProfileModel from "../../models/codechefProfile.model.js";

import { getCodeChefUserInfo } from "../../services/index.js";
import UserData from "../../models/userData.model.js";

import { isBanned } from "../../middleware/isBanned.js";

export const codechefCommands = (bot) => {
  // /codechef - Get CodeChef user info
  bot.command("codechef", isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [codechefCommands] /codechef triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    
      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user || !user.codechefId) {
        logger.warn(`[ID_NOT_SET] [codechefCommands] User not found or CodeChef ID not set for id: ${ctx.from.id}`);
        return ctx.reply(
          "Please set up your CodeChef username using /setup command."
        );
      }

      // Find userData document for this Telegram user
      let userData = await UserData.findOne({ telegramID: user._id });

      // Find an existing CodeChef profile by handle
      const ccHandle = user.codechefId;
      let profileDoc = await CodechefProfileModel.findOne({ handle: ccHandle });

      if (!userData || !userData.codechef) {
        // If no profileDoc yet, fetch from API and create one
        if (!profileDoc) {
          logger.info(`[CACHE MISS] [codechefCommands] No existing CodeChefProfile found for handle: ${ccHandle}. Fetching from API...`);
          // Fetch user info from CodeChef API
          const apiData = await getCodeChefUserInfo(ccHandle);

          if (!apiData) {
            logger.error(`[API_ERROR] [codechefCommands] Failed to fetch CodeChef data from API for handle: ${ccHandle}`);
            return ctx.reply(
              "Failed to fetch CodeChef user info. Please check your username with /info command."
            );
          }

          // Create a new CodeChefProfile document
          profileDoc = await CodechefProfileModel.create(apiData);
          logger.info(`[CREATION] [codechefCommands] Created new CodechefProfile in DB for handle: ${ccHandle}`);
        } else {
          logger.info(`[CACHE HIT] [codechefCommands] Found existing CodechefProfile in DB for handle: ${ccHandle}`);
        }

        if (userData) {
          userData.codechef = profileDoc._id;
          await userData.save();
          logger.info(`[UPDATION] [codechefCommands] Linked existing UserData with new CodeChef profile for user: ${user._id}`);
        } else {
          userData = await UserData.create({
            telegramID: user._id,
            codechef: profileDoc._id,
          });
          logger.info(`[CREATION] [codechefCommands] Created new UserData document for user: ${user._id}`);
        }
      } else {
        profileDoc = await CodechefProfileModel.findById(userData.codechef);
        if (!profileDoc) {
          logger.warn(`[MISSING] [codechefCommands] userData.codechef pointed to a missing profile. Re-creating/linking...`);
          const apiData = await getCodeChefUserInfo(ccHandle);
          if (!apiData) {
            logger.error(`[API_ERROR] [codechefCommands] Failed to fetch CodeChef data from API for handle: ${ccHandle}`);
            return ctx.reply(
              "Failed to fetch CodeChef user info. Please check your username with /info command."
            );
          }
          profileDoc = await CodechefProfileModel.findOneAndUpdate(
            {
              handle: ccHandle,
            },
            apiData,
            {
              upsert: true,
              new: true,
            }
          );
          userData.codechef = profileDoc._id;
          await userData.save();
          logger.info(`[UPDATION] [codechefCommands] Re-linked UserData with new CodeChef profile for user: ${user._id}`);
        } else{
          logger.info(`[CACHE HIT] [codechefCommands] Using saved CodeChefProfile from UserData.`);
        }
      }

      // Checking the timestamp to see if the profileDoc is outdated (more than 4 days)
      if(profileDoc){
        const now = Date.now();
        const lastUpdate = new Date(profileDoc.updatedAt).getTime();
        const fourDayMs  = 4* 24 * 60 * 60 * 1000;

        if(now-lastUpdate > fourDayMs){
          logger.info(`[CACHE MISS] [codechefCommands] CodeChef profile is outdated (>4 days). Fetching fresh data...`);
          const apiData = await getCodeChefUserInfo(ccHandle);
          if (apiData) {
            profileDoc = await CodechefProfileModel.findByIdAndUpdate(
              profileDoc._id,
              {...apiData},
              { new: true, runValidators: true }
            );
            profileDoc = await CodechefProfileModel.findById(profileDoc._id);
            logger.info(`[UPDATION] [codechefCommands] CodeChefProfile refreshed and saved for handle: ${ccHandle}`);
          }else{
            logger.error(`[API_ERROR] [codechefCommands] Failed to fetch updated CodeChef data from API for handle: ${ccHandle}`);
          }
          
          
        }else{
          logger.info(`[CACHE HIT] [codechefCommands] CodeChef profile is fresh (<4 days).`);

        }
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
      } = profileDoc;

      const message = `<b>CodeChef Handle:</b>
<b>Name:</b> ${name || "N/A"}
Country: ${countryName || "N/A"}
<b>Rating:</b> ${currentRating || "N/A"}
<b>Max Rating:</b> ${highestRating || "N/A"}
Global Rank: ${globalRank || "N/A"}
Country Rank: ${countryRank || "N/A"}
<b>Stars:</b> ${stars || "N/A"}`;

      await ctx.replyWithPhoto(
        { url: profile },
        { caption: message, parse_mode: "HTML" }
      );
      logger.info(`[RE_SUCCESS] [codechefCommands] CodeChef info sent for id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    } catch (error) {
      logger.error(`[COMMANDS] [codechefCommands] Error in /codechef command:`, error);
      ctx.reply(
        "Command not responding. Please try again later or check your CodeChef username with /info command."
      );
    }
  });

  // /codechefRating - Get CodeChef user rating
  //TODO: Use DB to fetch user ratings instead of API calls
  bot.command("codechefrating",isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [codechefCommands] /codechefrating triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user || !user.codechefId) {
        logger.warn(`[ID_NOT_SET] [codechefCommands] User not found or CodeChef ID not set for id: ${ctx.from.id}`);
        return ctx.reply(
          "Please set up your CodeChef username using /setup command."
        );
      }

      const userInfo = await getCodeChefUserInfo(user.codechefId);

      if (!userInfo || !userInfo.ratingData || userInfo.ratingData.length < 2) {
        logger.warn(`[DATA_ERROR] [codechefCommands] Not enough contest data to show rating changes for id: ${ctx.from.id}`);
        return ctx.reply("Not enough contest data to show rating changes.");
      }

      const ratingHistory = userInfo.ratingData;
      const latest = ratingHistory[ratingHistory.length - 1];
      const previous = ratingHistory[ratingHistory.length - 2];

      const currentRating = parseInt(latest.rating, 10);
      const previousRating = parseInt(previous.rating, 10);
      const ratingChange = currentRating - previousRating;
      const sign = ratingChange >= 0 ? "+" : "-";

      const message = `<b>Current Rating:</b> ${currentRating}
    <b>Previous Rating:</b> ${previousRating}
    <b>Rating Change:</b> ${sign}${Math.abs(ratingChange)}`;

      await ctx.reply(message, { parse_mode: "HTML" });
      logger.info(`[RE_SUCCESS] [codechefCommands] CodeChef rating info sent for id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    } catch (error) {
      logger.error(`[COMMANDS] [codechefCommands] Error in /codechefrating command:`, error);
      ctx.reply(
        "command not responding. Please try again later or check your CodeChef username with /info command."
      );
    }
  });
};
