// User management commands for the admin
import logger from "../../logger/logger.js"
import { isAdmin } from "../../middleware/isAdmin.js";

export const userManagementCommands = (bot) => {
    // ban a user by user ID
    bot.command("banuser", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [userManagementCommands] /banuser triggered by Admin`);
        await ctx.reply("Ban user functionality is not implemented yet.");
    });

    // unban a user by user ID
    bot.command("unbanuser", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [userManagementCommands] /unbanuser triggered by Admin`);
        await ctx.reply("Unban user functionality is not implemented yet.");
    });

    // list all banned users
    bot.command("listbannedusers", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [userManagementCommands] /listbannedusers triggered by Admin`);
        await ctx.reply("List banned users functionality is not implemented yet.");
    });

    // fetch user info from the database by user ID
    bot.command("userinfo", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [userManagementCommands] /userinfo triggered by Admin`);
        await ctx.reply("Fetch user info functionality is not implemented yet.");
    });

    // broadcast a message to all users
    bot.command("broadcast", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [userManagementCommands] /broadcast triggered by Admin`);
        await ctx.reply("Broadcast message functionality is not implemented yet.");
    });

    // view the help message for user management commands
    bot.command("userhelp", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [userManagementCommands] /userhelp triggered by Admin`);
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
}