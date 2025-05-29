import chalk from "chalk";
import User from "../models/user.model.js";

export const userCommands = (bot) => {
  // START command
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

    ctx.reply(
      `Welcome ${ctx.from.first_name}! Use /help to see available commands.`
    );
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
        "/info - Get your profile info saved on db\n" + // Get user info from DB
        "/setup - Set up your profile\n" // Ask for user id of platforms- Codeforces, Codechef, Leetcode
    );
  });

  // /info - Get profile info saved on db
  bot.command("info", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /info triggered by id: ${ctx.from.id} and username: ${
            ctx.from.username || "N/A"
          }`
        )
      );

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user) {
        console.log(chalk.yellow("[WARN] User not found in database."));
        return ctx.reply(
          "No profile found. Please register your handles first."
        );
      }

      const {
        leetcodeId = "Not set",
        codeforcesId = "Not set",
        codechefId = "Not set",
        firstName = "",
        lastName = "",
        username = "N/A",
      } = user;

      const fullName = `${firstName} ${lastName}`.trim() || "N/A";

      const message = `
Your profile info:

Name: ${fullName}
Telegram Username: @${username}
LeetCode: ${leetcodeId || "Not set"}
Codeforces: ${codeforcesId || "Not set"}
CodeChef: ${codechefId || "Not set"}
    `.trim();

      await ctx.reply(message);
      console.log(
        chalk.green(
          `[SUCCESS] /info response sent for Telegram ID: ${ctx.from.id}`
        )
      );
    } catch (error) {
      console.error(chalk.red("[FATAL] Error in /info command:"), error);
      ctx.reply("Oops! Something went wrong while fetching your profile info.");
    }
  });

  // /delete - Delete your profile from database
  bot.command("delete", async (ctx) => {
    try {
      console.log(
        chalk.cyan(
          `[COMMAND] /delete triggered by id: ${ctx.from.id} and username: ${
            ctx.from.username || "N/A"
          }`
        )
      );

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user) {
        console.log(chalk.yellow("[WARN] User not found in database."));
        return ctx.reply("No profile found to delete.");
      }

      await User.deleteOne({ telegramId: ctx.from.id });

      await ctx.reply("Your profile has been deleted successfully.");
      console.log(
        chalk.green(`[SUCCESS] Profile deleted for Telegram ID: ${ctx.from.id}`)
      );
    } catch (error) {
      console.error(chalk.red("[FATAL] Error in /delete command:"), error);
      ctx.reply("Oops! Something went wrong while deleting your profile.");
    }
  });
};
