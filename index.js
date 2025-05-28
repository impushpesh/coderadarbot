import { Telegraf } from "telegraf";

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
  console.log("Start command triggered by user:", ctx.from.id);
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
    console.log("New user saved:", newUser);
  } else {
    console.log("User already exists:", existingUser.telegramId);
    console.log("User data:", existingUser);
    console.log("Data saving denied");
  }

  ctx.reply(`Welcome ${ctx.from.first_name}!`);
});

// Help command
bot.help((ctx) => {
  console.log("Help command triggered by user:", ctx.from.id);
  ctx.reply(
    "The list of available commands:\n" +
      "/codeforce - Get Codeforces user info\n" +
      "/codeforce-rating - Get Codeforces user rating\n" +
      "/codechef - Get CodeChef user info\n" +
      "/codechef-rating - Get CodeChef user rating\n" +
      "/leetcode - Get LeetCode user Info\n" +
      "/leetcode-rating - Get LeetCode user rating\n" +
      "/contest - Get Upcoming  contest list\n" + // From Codechef + Codeforces + Leetcode
      "/setup - Set up your profile\n" // Ask for user id of platforms- Codeforces, Codechef, Leetcode
  );
});

// Setup command
const userStates = new Map(); // Telegram user ID -> { stage, data } Structure- Map<telegramUserId, { stage: string, data?: object }>

bot.command("setup", (ctx) => {
  console.log("Setup command triggered by user:", ctx.from.id);
  const userId = ctx.from.id;
  userStates.set(userId, { stage: "awaiting_codeforces" });
  ctx.reply("Please enter your Codeforces username: ");
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);

  if (!state) return;

  const input = ctx.message.text.trim();

  if (state.stage === "awaiting_codeforces") {
    console.log(`Received Codeforces username from user ${userId}: ${input}`);
    const valid = await getCodeforceUserInfo(input);
    if (!valid) return ctx.reply("Invalid Codeforces username. Try again.");

    state.data = { codeforcesId: input };
    state.stage = "awaiting_codechef";
    ctx.reply("Got it! Now enter your CodeChef username:");
  } else if (state.stage === "awaiting_codechef") {
    console.log(`Received CodeChef username from user ${userId}: ${input}`);
    state.data.codechefId = input;
    state.stage = "awaiting_leetcode";
    ctx.reply("Great! Now enter your LeetCode username:");
  } else if (state.stage === "awaiting_leetcode") {
    console.log(`Received LeetCode username from user ${userId}: ${input}`);
    state.data.leetcodeId = input;

    // Save to DB
    await User.updateOne({ telegramId: userId }, { $set: state.data });
    console.log(`Saved data to DB for user ${userId}:`, state.data);

    ctx.reply("Setup complete! Your platform handles have been saved.");
    userStates.delete(userId);
  }
});




// Bot launch
bot.launch();
console.log("Bot is running...");
bot.catch((err) => {
  console.error("Error occurred:", err);
});
