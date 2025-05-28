import { Telegraf } from "telegraf";
import chalk from "chalk";

import {
  getCodeforceUserInfo,
  getCodeChefUserInfo,
  getCodeforceContestList,
  getCodeforceRatingHistory,
} from "./services/index.js";

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./lib/connection.js";
await connectDB();

import User from "./models/user.model.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Start command
bot.start(async (ctx) => {
  console.log(
    chalk.cyan(
      `[COMMAND] /start triggered by id:  ${ctx.from.id} and username: ${
        ctx.from.username || "N/A"
      }`
    )
  );
  console.dir(ctx.from, { depth: null });

  const existingUser = await User.findOne({ telegramId: ctx.from.id });

  if (!existingUser) {
    const newUser = new User({
      telegramId: ctx.from.id,
      isBot: ctx.from.is_bot,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      username: ctx.from.username,
      languageCode: ctx.from.language_code,
    });

    await newUser.save();
    console.log(
      chalk.green(
        `[DB] New user saved: ${newUser.username || newUser.telegramId}`
      )
    );
  } else {
    console.log(
      chalk.yellow(
        `[DB] User already exists: ${
          existingUser.username || existingUser.telegramId
        }`
      )
    );
    console.log(
      chalk.gray(
        `[DB] Data saving denied for ${
          existingUser.username || existingUser.telegramId
        }`
      )
    );
  }

  ctx.reply(`Welcome ${ctx.from.first_name}!`);
});

// Help command
bot.help((ctx) => {
  console.log(
    chalk.cyan(
      `[COMMAND] /help triggered by id:  ${ctx.from.id} and username: ${
        ctx.from.username || "N/A"
      }`
    )
  );
  ctx.reply(
    "The list of available commands:\n" +
      "/codeforce - Get Codeforces user info\n" +
      "/codeforceRating - Get Codeforces user rating\n" +
      "/codechef - Get CodeChef user info\n" +
      "/codechefRating - Get CodeChef user rating\n" +
      "/leetcode - Get LeetCode user Info\n" +
      "/leetcodeRating - Get LeetCode user rating\n" +
      "/contest - Get Upcoming  contest list\n" + // From Codechef + Codeforces + Leetcode
      "/status- Get your status(Rating) in all platforms\n" + // Codeforces + Codechef + Leetcode
      "/delete - Delete your profile\n" + // Delete user info from DB
      "/setup - Set up your profile\n" // Ask for user id of platforms- Codeforces, Codechef, Leetcode
  );
});

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

// TODO: Send a graph also to the user, showing their ratings. Packages- chartjs, canva , chartjs-node-canvas
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

    await ctx.reply(message);
    console.log(
      chalk.green(
        `[SUCCESS] Rating change sent for id:  ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );
  } catch (error) {
    console.error(
      chalk.red("[FATAL] Error in /codeforceRating command:"),
      error
    );
    ctx.reply("Oops! Something went wrong while fetching your CodeForce info.");
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
    ctx.reply("Oops! Something went wrong while fetching your CodeChef info.");
  }
});

// TODO: Send a graph also to the user, showing their ratings.
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
    ctx.reply("Oops! Something went wrong while fetching your CodeChef info.");
  }
});

// TODO: Use graphql to get data for leetcode
// /leetcode - Get LeetCode user Info

// /leetcodeRating - Get LeetCode user rating

// /contest - Get Upcoming contest list

// /status - Get your status(Rating) in all platforms

// /delete - Delete your profile from database

// /info - Get your profile info

// Setup command
const userStates = new Map(); // Telegram user ID -> { stage, data } Structure- Map<telegramUserId, { stage: string, data?: object }>

bot.command("setup", (ctx) => {
  console.log(
    chalk.cyan(
      `[COMMAND] /setup triggered by id:  ${ctx.from.id} and username: ${
        ctx.from.username || "N/A"
      }`
    )
  );

  const userId = ctx.from.id;
  userStates.set(userId, { stage: "awaiting_codeforces" });

  console.log(
    chalk.yellow(`[INFO] Awaiting Codeforces username from user ${userId}`)
  );
  ctx.reply("Please enter your Codeforces username:");
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);

  if (!state) return;

  const input = ctx.message.text.trim();

  if (state.stage === "awaiting_codeforces") {
    console.log(
      chalk.cyan(`[INPUT] Codeforces username from ${userId}: ${input}`)
    );
    const valid = await getCodeforceUserInfo(input);
    if (!valid) {
      console.log(
        chalk.red(
          `[ERROR] Invalid Codeforces username from ${userId}: ${input}`
        )
      );
      return ctx.reply("Invalid Codeforces username. Try again.");
    }

    state.data = { codeforcesId: input };
    state.stage = "awaiting_codechef";
    console.log(chalk.green(`[OK] Codeforces username accepted for ${userId}`));
    ctx.reply("Got it! Now enter your CodeChef username:");
  } else if (state.stage === "awaiting_codechef") {
    console.log(
      chalk.cyan(`[INPUT] CodeChef username from ${userId}: ${input}`)
    );
    state.data.codechefId = input;
    state.stage = "awaiting_leetcode";
    console.log(chalk.green(`[OK] CodeChef username accepted for ${userId}`));
    ctx.reply("Great! Now enter your LeetCode username:");
  } else if (state.stage === "awaiting_leetcode") {
    console.log(
      chalk.cyan(`[INPUT] LeetCode username from ${userId}: ${input}`)
    );
    state.data.leetcodeId = input;

    await User.updateOne({ telegramId: userId }, { $set: state.data });
    console.log(
      chalk.green(`[SUCCESS] User data saved for ${userId}:`),
      state.data
    );

    ctx.reply("Setup complete! Your platform handles have been saved.");
    userStates.delete(userId);
  }
});

// Bot launch
bot.launch();
console.log(chalk.green("[INFO] Bot is running..."));

bot.catch((err) => {
  console.error(chalk.red("[FATAL] Error occurred:"), err);
});
