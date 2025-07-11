// Will contain db related commands
import logger from "../../logger/logger.js"
import { isAdmin } from "../../middleware/isAdmin.js";

export const dbCommands = (bot) => {
    // view the status of the database
    bot.command("dbstats", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [dbCommands] /dbstats triggered by Admin`);
        await ctx.reply("Database statistics are not implemented yet.");
    });

    // clean the database
    bot.command("cleandb", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [dbCommands] /cleandb triggered by Admin`);
        await ctx.reply("Cleaning the database is not implemented yet.");
    });

    // view the help message for db commands- list all db commands
    bot.command("dbhelp", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [dbCommands] /dbhelp triggered by Admin`);
        await ctx.reply("Database commands help is not implemented yet.");
    });
}