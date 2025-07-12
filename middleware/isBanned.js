// checks if the user is banned or not.
import User from "../models/user.model.js";
import logger from "../logger/logger.js";

export async function isBanned(ctx, next) {
  try {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      logger.warn("[MIDDLEWARE] [isBanned] Could not extract Telegram ID.");
      return ctx.reply("Unable to verify user identity.");
    }

    //! Checking ban status requires a database query- Improvement needed.
    const user = await User.findOne({ telegramId });

    if (user && user.isBanned) {
      logger.info(`[MIDDLEWARE] [isBanned] Banned user tried to use a command: ${telegramId}`);
      return ctx.reply("You are banned from using this bot.");
    }

    await next(); // Continue to next middleware/handler
  } catch (error) {
    logger.error(`[MIDDLEWARE] [isBanned] Error: ${error.message}`);
    return ctx.reply("An internal error occurred. Please try again later.");
  }
}
