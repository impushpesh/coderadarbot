// User management commands for the admin
import logger from "../../logger/logger.js";
import { isAdmin } from "../../middleware/isAdmin.js";

import dotenv from "dotenv";

import User from "../../models/user.model.js";

dotenv.config();

export const userManagementCommands = (bot) => {
  // ban a user by telegram ID
  bot.command("banuser", isAdmin, async (ctx) => {
    try {
      logger.info(
        `[COMMAND] [userManagementCommands] /banuser triggered by Admin`
      );

      // Extract Telegram ID from the message
      const args = ctx.message.text.split(" ").slice(1);
      if (args.length === 0) {
        return ctx.reply(
          "Please provide a Telegram ID to ban. \nUsage:\n<code>/banuser 123456789</code>",
          {
            parse_mode: "HTML",
          }
        );
      }

      const telegramId = Number(args[0]);
      if (isNaN(telegramId)) {
        return ctx.reply(
          "Invalid Telegram ID format. Please enter a valid number."
        );
      }

      if (telegramId === Number(process.env.ADMIN_ID)) {
        return ctx.reply("You cannot ban the admin.");
      }

      const user = await User.findOne({ telegramId });

      if (!user) {
        return ctx.reply(`User with ID ${telegramId} not found.`);
      }

      if (user.isBanned) {
        return ctx.reply(`User with ID ${telegramId} is already banned.`);
      }

      user.isBanned = true;
      await user.save();

      // Send a message to the user if they are currently online
      if (ctx.telegram) {
        try {
          await ctx.telegram.sendMessage(telegramId, "You have been banned from using the bot. Please contact the admin for more information.");
        } catch (error) {
          logger.error(`[COMMAND] [userManagementCommands] Error sending ban message to user ${telegramId}: ${error.message}`);
        }
      }

      logger.warn(
        `[COMMAND] [userManagementCommands] User ${telegramId} has been banned.`
      );
      await ctx.reply(
        `User with ID ${telegramId} has been successfully banned.`
      );
    } catch (error) {
      logger.error(
        `[COMMAND] [userManagementCommands] Error in /banuser: ${error.message}`
      );
      await ctx.reply(
        "An error occurred while trying to ban the user. Please try again later."
      );
    }
  });

  // unban a user by telegram ID
  bot.command("unbanuser", isAdmin, async (ctx) => {
    try {
      logger.info(
        `[COMMAND] [userManagementCommands] /unbanuser triggered by Admin`
      );

      // Extract Telegram ID from the message
      const args = ctx.message.text.split(" ").slice(1);
      if (args.length === 0) {
        return ctx.reply(
          "Please provide a Telegram ID to unban. \nUsage:\n<code>/unbanuser 123456789</code>",
          { parse_mode: "HTML" }
        );
      }

      const telegramId = Number(args[0]);
      if (isNaN(telegramId)) {
        return ctx.reply(
          "Invalid Telegram ID format. Please enter a valid number."
        );
      }

      const user = await User.findOne({ telegramId });

      if (!user) {
        return ctx.reply(`User with ID ${telegramId} not found.`);
      }

      if (!user.isBanned) {
        return ctx.reply(`User with ID ${telegramId} is not banned.`);
      }

      user.isBanned = false;
      await user.save();

      if (ctx.telegram) {
        try {
          await ctx.telegram.sendMessage(telegramId, "Your ban has been lifted. You can now use the bot again. ");
        } catch (error) {
          logger.error(`[COMMAND] [userManagementCommands] Error sending unban message to user ${telegramId}: ${error.message}`);
        }
      }

      logger.warn(
        `[COMMAND] [userManagementCommands] User ${telegramId} has been unbanned.`
      );
      await ctx.reply(
        `User with ID ${telegramId} has been successfully unbanned.`
      );
    } catch (error) {
      logger.error(
        `[COMMAND] [userManagementCommands] Error in /unbanuser: ${error.message}`
      );
      await ctx.reply(
        "An error occurred while trying to unban the user. Please try again later."
      );
    }
  });

  // list all banned users
  bot.command("listbannedusers", isAdmin, async (ctx) => {
    try {
      logger.info(
        `[COMMAND] [userManagementCommands] /listbannedusers triggered by Admin`
      );

      const bannedUsers = await User.find({ isBanned: true }, "telegramId");

      if (bannedUsers.length === 0) {
        return ctx.reply("There are no banned users at the moment.");
      }

      const ids = bannedUsers.map((user) => user.telegramId).join("\n");

      const message = `<b>Banned Telegram IDs</b>\n━━━━━━━━━━━━━━━━━━━━\n${ids}`;

      await ctx.reply(message, { parse_mode: "HTML" });

      logger.info(
        `[COMMAND] [userManagementCommands] Listed ${bannedUsers.length} banned user IDs`
      );
    } catch (error) {
      logger.error(
        `[COMMAND] [userManagementCommands] Error in /listbannedusers: ${error.message}`
      );
      await ctx.reply("An error occurred while listing banned users.");
    }
  });

  // fetch user info from the database by telegram ID
  bot.command("userinfo", isAdmin, async (ctx) => {
    try {
      logger.info(
        `[COMMAND] [userManagementCommands] /userinfo triggered by Admin`
      );

      // Extract Telegram ID from the message
      const args = ctx.message.text.split(" ").slice(1);
      if (args.length === 0) {
        return ctx.reply(
          "Please provide a Telegram ID to fetch user info. \nUsage:\n<code>/userinfo 123456789</code>",
          {
            parse_mode: "HTML",
          }
        );
      }

      const telegramId = Number(args[0]);
      if (isNaN(telegramId)) {
        return ctx.reply(
          "Invalid Telegram ID format. Please enter a valid number."
        );
      }

      const user = await User.findOne({ telegramId });

      if (!user) {
        return ctx.reply(`User with ID ${telegramId} not found.`);
      }

      let message =
        `<b>User Information</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<b>First Name:</b> ${user.firstName || "N/A"}\n` +
        `<b>Last Name:</b> ${user.lastName || "N/A"}\n` +
        `<b>Username:</b> @${user.username || "N/A"}\n` +
        `<b>Banned:</b> ${user.isBanned ? "Yes" : "No"}\n\n` +
        `<b>Codeforces:</b> ${user.codeforcesId || "Not linked"}\n` +
        `<b>LeetCode:</b> ${user.leetcodeId || "Not linked"}\n` +
        `<b>CodeChef:</b> ${user.codechefId || "Not linked"}\n`;

      await ctx.reply(message.trim(), { parse_mode: "HTML" });

      logger.info(
        `[COMMAND] [userManagementCommands] User info sent for ID: ${telegramId}`
      );
    } catch (error) {
      logger.error(
        `[COMMAND] [userManagementCommands] Error in /userinfo: ${error.message}`
      );
      await ctx.reply(
        "An error occurred while trying to fetch user info. Please try again later."
      );
    }
  });

  // broadcast a message to all users
  //TODO: Implementation pending
  bot.command("broadcast", isAdmin, async (ctx) => {
    logger.info(
      `[COMMAND] [userManagementCommands] /broadcast triggered by Admin`
    );
    await ctx.reply("Broadcast message functionality is not implemented yet.");
  });

  // view the help message for user management commands
  bot.command("userhelp", isAdmin, async (ctx) => {
    logger.info(
      `[COMMAND] [userManagementCommands] /userhelp triggered by Admin`
    );
    await ctx.reply(
      "<b>The list of available user management commands:</b>\n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "<b>/banuser</b> - Ban a user by user ID\n" +
        "<b>/unbanuser</b> - Unban a user by user ID\n" +
        "<b>/listbannedusers</b> - List all banned users\n" +
        "<b>/userinfo</b> - Fetch user info by user ID\n" +
        "<b>/broadcast</b> - Broadcast a message to all users\n" +
        "<b>/userhelp</b> - View this help message\n",
      { parse_mode: "HTML" }
    );
  });
};
