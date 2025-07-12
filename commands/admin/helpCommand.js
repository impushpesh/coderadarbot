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
            "\n<b>Database Commands</b>\n" +
            "• /dbhelp - View database commands help\n"+
            "\n<b>Job Commands</b>\n" +
            "• /jobhelp - View job commands help\n"+
            "\n<b>Log Commands</b>\n" +
            "• /loghelp - View log commands help\n"+
            "\n<b>User management Commands</b>\n" +
            "• /userhelp - View user management commands help\n"+
            "\n<b>Admin Commands</b>\n" +
            "• /viewalladmincommands - View all admin commands\n",
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
            "<b>Job commands:</b>\n" +
            "<b>/jobqueue</b> - View active/pending background jobs\n" +
            "<b>/jobhelp</b> - View this help message\n" +
            "━━━━━━━━━━━━━━━━━━━━\n" +
            "<b>Log commands:</b>\n" +
            "<b>/viewlog</b> - View recent logs\n" +
            "<b>/viewerrorlog</b> - View error logs\n" +
            "<b>/viewfatallog</b> - View fatal logs\n" +
            "<b>/clearlog</b> - Clear the logs\n" +
            "<b>/loghelp</b> - View this help message\n" +
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