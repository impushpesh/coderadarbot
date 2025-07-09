import chalk from "chalk";
import User from "../../models/user.model.js";
import { getCodeforceUserInfo } from "../../services/index.js"; // Adjust this import as needed

// Store user setup progress
const userStates = new Map(); // Map<telegramUserId, { stage: string, data?: object }>

export const setupCommand = (bot) => {
  // /setup command handler
  bot.command("setup", (ctx) => {
    console.log(
      chalk.cyan(
        `[COMMAND] /setup triggered by id: ${ctx.from.id}, username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const userId = ctx.from.id;
    userStates.set(userId, { stage: "awaiting_codeforces" });

    console.log(
      chalk.yellow(`[INFO] Awaiting Codeforces username from user ${userId}`)
    );
    ctx.reply("1️⃣ Please enter your Codeforces username:");
  });

  // Handle user text input step-by-step
  bot.on("text", async (ctx,next) => {
    const userId = ctx.from.id;
    const state = userStates.get(userId);
    if (!state) return next(); // No setup in progress for this user

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
      console.log(
        chalk.green(`[OK] Codeforces username accepted for ${userId}`)
      );
      ctx.reply("2️⃣ Got it! Now enter your CodeChef username:");
    } else if (state.stage === "awaiting_codechef") {
      console.log(
        chalk.cyan(`[INPUT] CodeChef username from ${userId}: ${input}`)
      );
      state.data.codechefId = input;
      state.stage = "awaiting_leetcode";
      console.log(chalk.green(`[OK] CodeChef username accepted for ${userId}`));
      ctx.reply("3️⃣ Great! Now enter your LeetCode username:");
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

      ctx.reply(
        "<b>Setup complete!</b>🎉🎉\nYour platform handles have been saved.\nYou can now use commands like /status to check your ratings.\nUse /help to see available commands.",
        { parse_mode: "HTML" }
      );
      userStates.delete(userId);
    }
  });
};
