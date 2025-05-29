import chalk from "chalk";
import User from "../models/user.model.js";

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

      const userInfo = await getLeetCodePublicProfile(user.leetcodeId);

      if (!userInfo) {
        console.log(chalk.red("[ERROR] Failed to fetch LeetCode user info."));
        return ctx.reply(
          "Failed to fetch LeetCode user info. Please check your username from the /info command."
        );
      }

      const { badge, avatar, ranking, country, linkedin, github, twitter } =
        userInfo;

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
