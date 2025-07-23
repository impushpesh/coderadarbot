// Contains the help command
import logger from "../../logger/logger.js"
import { isAdmin } from "../../middleware/isAdmin.js";

export const helpCommand = (bot) => {
    // view the help message for help commands
    bot.command("helpadmin", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [helpCommand] /helpadmin triggered by Admin`);
        await ctx.reply(
            "<b>The list of available commands:</b>\n" +
            "━━━━━━━━━━━━━━━━━━━━\n" +
            "<b>System Commands</b>\n" +
            "• /systemhelp - View system commands help\n" +
            "\n<b>User management Commands</b>\n" +
            "• /userhelp - View user management commands help\n"+
            "\n<b>Admin Commands</b>\n" +
            "• /viewadmincommands - View all admin commands\n",
            { parse_mode: "HTML" }
        );
    });

    // view all available admin commands
    bot.command("viewadmincommands", isAdmin, async (ctx) => {
        logger.info(`[COMMAND] [helpCommand] /viewadmincommands triggered by Admin`);
        await ctx.reply(
            "<b>The list of available admin commands:</b>\n" +
            "━━━━━━━━━━━━━━━━━━━━\n" +
            "<b>UserManagement commands:</b>\n" +
            "<b>/banuser</b> - Ban a user by user ID\n" +
            "<b>/unbanuser</b> - Unban a user by user ID\n" +
            "<b>/listbannedusers</b> - List all banned users\n" +
            "<b>/userinfo</b> - Fetch user info by user ID\n" +
            "<b>/broadcast</b> - Broadcast a message to all users\n" +
            "<b>/userhelp</b> - View help message\n" +
            "━━━━━━━━━━━━━━━━━━━━\n" +
            "<b>System commands:</b>\n" +
            "<b>/botstats</b> - View bot statistics\n" +
            "<b>/restartbot</b> - Restart the bot\n" +
            "<b>/uptime</b> - View bot uptime\n" +
            "<b>/totalusers</b> - View total number of users\n" +
            "<b>/systemhelp</b> - View this help message\n",
            { parse_mode: "HTML" }
        );
    });
}