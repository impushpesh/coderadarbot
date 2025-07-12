// will contain the commands for bot/system
import logger from "../../logger/logger.js"
import { isAdmin } from "../../middleware/isAdmin.js";

export const systemCommands = (bot) => {
    // view the status of the bot
    bot.command("botstats", isAdmin,async (ctx) => {
        logger.info(`[COMMAND] [systemCommands] /botstats triggered by Admin`);
        await ctx.reply("Bot statistics are not implemented yet.");
    });

    // restart the bot
    bot.command("restartbot", isAdmin,async (ctx) => {
        logger.info(`[COMMAND] [systemCommands] /restartbot triggered by Admin`);
        await ctx.reply("Restarting the bot is not implemented yet.");
    });

    // view the uptime of the bot
    bot.command("uptime", isAdmin,async (ctx) => {
        logger.info(`[COMMAND] [systemCommands] /uptime triggered by Admin`);
        await ctx.reply("Uptime is not implemented yet.");
    }); 

    // view the total number of users
    bot.command("totalusers", isAdmin,async (ctx) => {
        logger.info(`[COMMAND] [systemCommands] /totalusers triggered by Admin`);
        await ctx.reply("Total users count is not implemented yet.");
    });

    // view the help message for system commands- show all available system commands
    bot.command("systemhelp", isAdmin,async (ctx) => {
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
    });


};