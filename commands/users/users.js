import logger from "../../logger/logger.js"
import User from "../../models/user.model.js";

import { isBanned } from "../../middleware/isBanned.js";

export const userCommands = (bot) => {
  // START command
  //!NOTE: isBanned is not implemented here
  bot.start(async (ctx) => {
    logger.info(`[COMMAND] [userCommands] /start triggered by id:  ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

    logger.debug(`User info: ${JSON.stringify(ctx.from, null, 2)}`);

    const existingUser = await User.findOne({ telegramId: ctx.from.id });

    if (!existingUser) {
      const newUser = new User({
        telegramId: ctx.from.id,
        isBot: ctx.from.is_bot,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await newUser.save();
      logger.info(`[CREATION] [userCommands] New user saved: ${newUser.username || newUser.telegramId}`)
    } else {
      logger.info(`[CACHE HIT] [userCommands] User already exists: ${existingUser.username || existingUser.telegramId}`)
    }

    ctx.reply(
      `Welcome <b>${ctx.from.first_name}!</b>\n Use /help to see available commands.\n Use /setup to set up your profile.`,
      {
        parse_mode: "HTML",
      }
    );
  });

  // Help command
  //!NOTE: isBanned is not implemented here
  bot.help((ctx) => {
    logger.info(`[COMMAND] [userCommands] /help triggered by id:  ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);
    logger.debug(`User info: ${JSON.stringify(ctx.from, null, 2)}`);

    ctx.reply(
      "<b>The list of available commands:</b>\n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "<b>CodeForce</b>\n" +
        "• /codeforce - Get Codeforces user info\n" +
        "• /codeforceratinggraph - Get Codeforces user rating\n" +
        "           \n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "<b>CodeChef</b>\n" +
        "• /codechef - Get CodeChef user info\n" +
        "• /codechefrating - Get CodeChef user rating\n" +
        "           \n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "<b>Leetcode</b>\n" +
        "• /leetcode - Get LeetCode user Info\n" +
        "• /leetcoderatinggraph - Get LeetCode user rating\n" +
        "           \n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "<b>Others</b>\n" +
        "• /contest - Get Upcoming  contest list\n" + // From Codechef + Codeforces + Leetcode
        "• /status- Get your status across all platforms\n" + // Codeforces + Codechef + Leetcode
        "• /info - Get your profile info saved on db\n" + // Get user info from DB
        "• /setup - Set up your profile\n" + // Ask for user id of platforms- Codeforces, Codechef, Leetcode
        "• /togglecontestalerts - Toggle contest alerts\n" + // Enable/Disable contest alerts
        "           \n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        " ❌ DANGER ZONE: ❌\n" +
        "           \n" +
        "• /delete - Delete your profile from database\n", // Delete user info from DB
      { parse_mode: "HTML" }
    );
  });

  // /info - Get profile info saved on db
  bot.command("info", isBanned, async (ctx) => {
    try {

      logger.info(`[COMMAND] [userCommands] /info triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`)

      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user) {
        logger.warn(`[CACHE MISS] [userCommands] User data missing`)
        return ctx.reply(
          "No profile found. Please register your handles first.\n Use: /start then /setup"
        );
      }

      const {
        leetcodeId = "Not set",
        codeforcesId = "Not set",
        codechefId = "Not set",
        firstName = "",
        lastName = "",
        username = "N/A",
      } = user;

      const fullName = `${firstName} ${lastName}`.trim() || "N/A";

      const message = `
<b>Your profile info:</b>

<b>Name:</b> ${fullName}
<b>Telegram Username:</b> @${username}
<b>LeetCode:</b> ${
        leetcodeId
          ? `<a href="https://leetcode.com/${leetcodeId}">${leetcodeId}</a>`
          : "Not set"
      }
<b>Codeforces:</b> ${
        codeforcesId
          ? `<a href="https://codeforces.com/profile/${codeforcesId}">${codeforcesId}</a>`
          : "Not set"
      }
<b>CodeChef:</b> ${
        codechefId
          ? `<a href="https://www.codechef.com/users/${codechefId}">${codechefId}</a>`
          : "Not set"
      }
    `.trim();

      await ctx.reply(message, { parse_mode: "HTML" });
      logger.info(`[RE_SUCCESS] [userCommands] /info response sent for Telegram ID: ${ctx.from.id}`);
    } catch (error) {
      logger.error(`[COMMAND] [userCommands] Error in /info command:`, error);
      ctx.reply("Error in info command");
    }
  });

  // /delete - Delete your profile from database TODO: Have to configure this command so that there will be a cooling period before deletion of profile
  bot.command("delete", isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [userCommands] /delete triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user) {
        logger.warn(`[CACHE MISS] [userCommands] User data missing`);
        return ctx.reply("No profile found to delete.");
      }

      await User.deleteOne({ telegramId: ctx.from.id });

      await ctx.reply(
        "Your profile has been deleted successfully.\n Use /start to create a new profile then proceed with /setup to set up your handles again."
      );
      logger.info(`[DELETION] [userCommands] Successfully deleted profile for Telegram ID: ${ctx.from.id}`)
    } catch (error) {
      logger.error(`[COMMAND] [userCommands] Error in /delete command:`, error);
      ctx.reply("Error in delete command");
    }
  });

  // /toggleContestAlerts - Toggle contest alerts
  bot.command("togglecontestalerts", isBanned, async (ctx) => {
    try {
      logger.info(`[COMMAND] [userCommands] /togglecontestalerts triggered by id: ${ctx.from.id} and username: ${ctx.from.username || "N/A"}`);

      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user) {
        logger.warn(`[CACHE MISS] [userCommands] User data missing`);
        return ctx.reply("No profile found. Please register your handles first.\n Use: /start then /setup");
      }

      user.contestAlertsEnabled = !user.contestAlertsEnabled;
      await user.save();

      const status = user.contestAlertsEnabled ? "enabled" : "disabled";
      await ctx.reply(`Contest alerts have been ${status}.`);
      logger.info(`[TOGGLE] [userCommands] Contest alerts ${status} for Telegram ID: ${ctx.from.id}`);
    } catch (error) {
      logger.error(`[COMMAND] [userCommands] Error in /togglecontestalerts command:`, error);
      ctx.reply("Error toggling contest alerts");
    }
  });
};
