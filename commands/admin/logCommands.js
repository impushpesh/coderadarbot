// Log realted commands

import logger from "../../logger/logger.js"
import { isAdmin } from "../../middleware/isAdmin.js";

export const logCommands = (bot) => {
    // View the recent logs of the bot
    bot.command("viewlog", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [logCommands] /viewlog triggered by Admin`);
        await ctx.reply("Viewing logs is not implemented yet.");
    });

    // View the error logs of the bot
    bot.command("viewerrorlog", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [logCommands] /viewerrorlog triggered by Admin`);
        await ctx.reply("Viewing error logs is not implemented yet.");
    });

    // View fatal logs of the bot
    bot.command("viewfatallog", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [logCommands] /viewfatallog triggered by Admin`);
        await ctx.reply("Viewing fatal logs is not implemented yet.");
    });

    // Clear the logs of the bot
    bot.command("clearlog", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [logCommands] /clearlog triggered by Admin`);
        await ctx.reply("Clearing logs is not implemented yet.");
    });

    // log help
    bot.command("loghelp", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [logCommands] /loghelp triggered by Admin`);
        await ctx.reply(
            "<b>The list of available Log commands:</b>\n" +
            "━━━━━━━━━━━━━━━━━━━━\n" +
            "<b>/viewlog</b> - View recent logs\n" +
            "<b>/viewerrorlog</b> - View error logs\n" +
            "<b>/viewfatallog</b> - View fatal logs\n" +
            "<b>/clearlog</b> - Clear the logs\n" +
            "<b>/loghelp</b> - View this help message\n",
            { parse_mode: "HTML" }
        );
    });

    
}