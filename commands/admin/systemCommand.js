// will contain the commands for bot/system
// viewlog, botstats, restartBot, dbstats, uptime, jobqueue( Shows active/pending background jobs.), total users, clean db- clears everything

import chalk from "chalk";
import { isAdmin } from "../../middleware/isAdmin.js";

export const systemCommands = (bot) => {
    // View the logs of the bot
    bot.command("viewlog", isAdmin,async (ctx) => {
        console.log(chalk.cyan(`[COMMAND] /viewlog triggered by ${ctx.from.id}`));
        await ctx.reply("Viewing logs is not implemented yet.");
    });
    // view the status of the bot
    bot.command("botstats", isAdmin,async (ctx) => {
        console.log(chalk.cyan(`[COMMAND] /botstats triggered by ${ctx.from.id}`));
        await ctx.reply("Bot statistics are not implemented yet.");
    });
};