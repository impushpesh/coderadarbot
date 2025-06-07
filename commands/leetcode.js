import chalk from "chalk";
import User from "../models/user.model.js";
import UserData from "../models/userData.model.js";
import LeetcodeProfileModel from "../models/leetcodeProfile.model.js";

import {
  getLeetCodePublicProfile,
  getLeetCodeRatingInfo,
} from "../services/index.js";

import { generateLeetCodeChart } from "../utils/leetcodeChartGenerator.js";

export const leetcodeCommands = (bot) => {
  // /leetcode - Get LeetCode user Info
  bot.command("leetcode", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /leetcode triggered by id:  ${ctx.from.id} and username: ${
            ctx.from.username || "N/A"
          }`
        )
      );

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user || !user.leetcodeId) {
        console.log(
          chalk.yellow("[WARN] User not found or LeetCode ID not set.")
        );
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
          console.log(
            chalk.blue(
              "[INFO] No existing LeetCode profile found. Fetching from API..."
            )
          );
          const apiData = await getLeetCodePublicProfile(lcHandle);

          if (!apiData) {
            console.log(
              chalk.red("[ERROR] Failed to fetch LeetCode data from API.")
            );
            return ctx.reply(
              "Failed to fetch LeetCode user info. Please check your username with /info."
            );
          }

          profileDoc = await LeetcodeProfileModel.create(apiData);
          console.log(chalk.green("[INFO] Created new LeetcodeProfile in DB."));
        } else {
          console.log(
            chalk.green("[CACHE HIT] Found existing LeetcodeProfile in DB.")
          );
        }

        if (userData) {
          userData.leetcode = profileDoc._id;
          await userData.save();
          console.log(
            chalk.green("[INFO] Linked existing Leetcode profile to UserData.")
          );
        } else {
          userData = await UserData.create({
            telegramID: user._id,
            leetcode: profileDoc._id,
          });
          console.log(
            chalk.green(
              "[INFO] Created new UserData and linked Leetcode profile."
            )
          );
        }
      } else {
        // userData exists AND userData.leetcode is already set
        profileDoc = await LeetcodeProfileModel.findById(userData.leetcode);

        if (!profileDoc) {
          console.log(
            chalk.yellow(
              "[WARN] userData.leetcode pointed to a missing profile. Re-creating/linking..."
            )
          );

          const apiData = await getLeetCodePublicProfile(lcHandle);

          if (!apiData) {
            return ctx.reply(
              "Failed to re-fetch LeetCode info. Please check your username."
            );
          }

          profileDoc = await LeetcodeProfileModel.findOneAndUpdate(
            { username: lcHandle },
            apiData,
            { upsert: true, new: true }
          );

          userData.leetcode = profileDoc._id;
          await userData.save();

          console.log(
            chalk.green(
              "[INFO] Re-linked or re-created missing Leetcode profile."
            )
          );
        } else {
          console.log(
            chalk.green(
              "[CACHE HIT] Using saved LeetcodeProfile from UserData."
            )
          );
        }
      }

      const { badge, avatar, ranking, country, linkedin, github, twitter } =
        profileDoc;

      const message = `
    <b>LeetCode ID:</b> ${user.leetcodeId}
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
      console.log(
        chalk.green(
          `[SUCCESS] LeetCode user info sent for id:  ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
        )
      );
    } catch (error) {
      console.error(chalk.red("[FATAL] Error in /leetcode command:"), error);
      ctx.reply(
        "Oops! Something went wrong while fetching your LeetCode info."
      );
    }
  });

  // /leetcodeRating - Get LeetCode user rating
  bot.command("leetcodeRating", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /leetcodeRating triggered by id: ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
        )
      );

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user || !user.leetcodeId) {
        console.log(chalk.yellow("[WARN] LeetCode ID not found."));
        return ctx.reply(
          "Please set up your LeetCode username using /setup command."
        );
      }

      const userInfo = await getLeetCodeRatingInfo(user.leetcodeId);

      if (!userInfo || !userInfo.history || userInfo.history.length === 0) {
        return ctx.reply("Could not fetch your LeetCode contest data.");
      }

      const { attendedContestsCount, rating } = userInfo;
      const history = userInfo.history.filter((entry) => entry.attended);

      if (history.length < 2) {
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

      console.log(
        chalk.green(
          `[SUCCESS] LeetCode rating chart sent for id: ${
            ctx.from.id
          } and username: ${ctx.from.username || "N/A"}`
        )
      );
    } catch (error) {
      console.error(
        chalk.red("[FATAL] Error in /leetcodeRating command:"),
        error
      );
      ctx.reply(
        "Oops! Something went wrong while fetching your LeetCode info."
      );
    }
  });
};
