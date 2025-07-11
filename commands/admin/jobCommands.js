// COntains all job(agenda) related commands
import logger from "../../logger/logger.js"
import { isAdmin } from "../../middleware/isAdmin.js";

export const jobCommands = (bot) => {
    // view the active/pending background jobs
    bot.command("jobqueue", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [jobCommands] /jobqueue triggered by Admin`);
        await ctx.reply("Job queue is not implemented yet.");
    });

    // view the help message for job commands
    bot.command("jobhelp", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [jobCommands] /jobhelp triggered by Admin`);
        await ctx.reply("Job commands help is not implemented yet.");
    });
}