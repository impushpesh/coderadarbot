import chalk from "chalk";
import User from "../models/user.model.js";
import CodechefProfileModel from "../models/codechefProfile.model.js";

import { getCodeChefUserInfo } from "../services/index.js";
import UserData from "../models/userData.model.js";

export const codechefCommands = (bot) => {
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

      // Find userData document for this Telegram user
      let userData = await UserData.findOne({ telegramID: user._id });

      // Find an existing CodeChef profile by handle
      const ccHandle = user.codechefId;
      let profileDoc = await CodechefProfileModel.findOne({ handle: ccHandle });

      if (!userData || !userData.codechef) {
        // If no profileDoc yet, fetch from API and create one
        if (!profileDoc) {
          console.log(
            chalk.blue(
              "[INFO] No existing CodeChef profile found. Fetching from API..."
            )
          );
          const apiData = await getCodeChefUserInfo(ccHandle);

          if (!apiData) {
            console.log(
              chalk.red("[ERROR] Failed to fetch CodeChef data from API.")
            );
            return ctx.reply(
              "Failed to fetch CodeChef user info. Please check your username with /info command."
            );
          }

          // Create a new CodeChefProfile document
          profileDoc = await CodechefProfileModel.create(apiData);
          console.log(chalk.green("[INFO] Created new CodechefProfile in DB."));
        } else {
          console.log(
            chalk.green("[CACHE HIT] Found existing CodeforcesProfile in DB.")
          );
        }

        if (userData) {
          userData.codechef = profileDoc._id;
          await userData.save();
          console.log(
            chalk.green("[INFO] Linked existing CC profile to UserData.")
          );
        } else {
          userData = await UserData.create({
            telegramID: user._id,
            codechef: profileDoc._id,
          });
          console.log(
            chalk.green("[INFO] Created new UserData and linked CF profile.")
          );
        }
      } else {
        profileDoc = await CodechefProfileModel.findById(userData.codechef);
        if (!profileDoc) {
          console.log(
            chalk.yellow(
              "[WARN] userData.codechef pointed to a missing profile. Re-creating/linking..."
            )
          );
          const apiData = await getCodeChefUserInfo(ccHandle);
          if (!apiData) {
            console.log(
              chalk.red("[ERROR] Failed to fetch CodeChef data from API.")
            );
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
          console.log(
            chalk.green("[INFO] Re-linked or re-created missing CC profile.")
          );
        } else{
          console.log(
            chalk.green(
              "[CACHE HIT] Using saved CodeChefProfile from UserData."
            )
          );
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

      const message = `<b>Current Rating:</b> ${currentRating}
    <b>Previous Rating:</b> ${previousRating}
    <b>Rating Change:</b> ${sign}${Math.abs(ratingChange)}`;

      await ctx.reply(message, { parse_mode: "HTML" });
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
};
