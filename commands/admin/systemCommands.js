// will contain the commands for bot/system
import logger from "../../logger/logger.js";
import { isAdmin } from "../../middleware/isAdmin.js";

import os from "os";

import User from "../../models/user.model.js";

export const systemCommands = (bot) => {
  // view the uptime of the bot
  bot.command("uptime", isAdmin, async (ctx) => {
    try {
      logger.info(`[COMMAND] [systemCommands] /uptime triggered by Admin`);
      const uptimeSec = process.uptime();
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = Math.floor(uptimeSec % 60);
      await ctx.reply(`Bot Uptime: ${hours}h ${minutes}m ${seconds}s`);
    } catch (error) {
      logger.error(
        `[COMMAND] [systemCommands] /uptime error: ${error.message}`
      );
      await ctx.reply("An error occurred while fetching bot uptime.");
    }
  });

  // restart the bot
  //TODO: Implementation pending
  bot.command("restartbot", isAdmin, async (ctx) => {
    try {
      logger.warn(`[COMMAND] [systemCommands] /restartbot triggered by Admin`);
      await ctx.reply("Implementation pending. Bot will restart now.");
    } catch (error) {
      logger.error(
        `[COMMAND] [systemCommands] /restartbot error: ${error.message}`
      );
      await ctx.reply("An error occurred while trying to restart the bot.");
    }
  });

  // view the status of the bot
  bot.command("botstats", isAdmin, async (ctx) => {
    try {
      logger.info(`[COMMAND] [systemCommands] /botstats triggered by Admin`);

      const memory = process.memoryUsage();
      const totalMemMB = (os.totalmem() / 1024 / 1024).toFixed(0);
      const usedMemMB = (memory.rss / 1024 / 1024).toFixed(2);

      const cpuUsage = process.cpuUsage();
      const cpuUser = (cpuUsage.user / 1000).toFixed(2); // in milliseconds
      const cpuSystem = (cpuUsage.system / 1000).toFixed(2); // in milliseconds

      const uptimeSec = Math.floor(process.uptime());
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = uptimeSec % 60;
      const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

      const statusMessage =
        `<b>Bot Status Report</b>\n` +
        `------------------------------\n` +
        `<b>Memory Usage:</b> ${usedMemMB} MB / ${totalMemMB} MB\n` +
        `<b>CPU Usage:</b> User: ${cpuUser} ms, System: ${cpuSystem} ms\n` +
        `<b>Uptime:</b> ${formattedUptime}`;

      await ctx.reply(statusMessage, { parse_mode: "HTML" });
    } catch (error) {
      logger.error(
        `[COMMAND] [systemCommands] /botstats error: ${error.message}`
      );
      await ctx.reply("An error occurred while fetching bot status.");
    }
  });

  // view the total number of users
  bot.command("totalusers", isAdmin, async (ctx) => {
    try {
      logger.info(`[COMMAND] [systemCommands] /totalusers triggered by Admin`);
      const count = await User.countDocuments();
      await ctx.reply(`Total registered users: ${count}`);
    } catch (error) {
      logger.error(
        `[COMMAND] [systemCommands] /totalusers error: ${error.message}`
      );
      await ctx.reply("An error occurred while fetching total users count.");
    }
  });

  // view the help message for system commands- show all available system commands
  bot.command("systemhelp", isAdmin, async (ctx) => {
    try {
      logger.info(`[COMMAND] [systemCommands] /systemhelp triggered by Admin`);
      await ctx.reply(
        "<b>The list of available system commands:</b>\n" +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "<b>/botstats</b> - View bot statistics\n" +
          "<b>/restartbot</b> - Restart the bot\n" +
          "<b>/uptime</b> - View bot uptime\n" +
          "<b>/totalusers</b> - View total number of users\n" +
          "<b>/systemhelp</b> - View this help message\n",
        { parse_mode: "HTML" }
      );
    } catch (error) {
      logger.error(
        `[COMMAND] [systemCommands] /systemhelp error: ${error.message}`
      );
      await ctx.reply("An error occurred while fetching system commands help.");
    }
  });
};
