import { Telegraf } from "telegraf";
import logger from "./logger/logger.js"
import dotenv from "dotenv";
import connectDB from "./lib/connection.js";
import { registerCommands } from "./commands/index.js";


dotenv.config();

await connectDB(); 

const bot = new Telegraf(process.env.BOT_TOKEN);

registerCommands(bot);

// Bot launch
bot.launch();
logger.debug("Bot is running...")


bot.catch((err) => {
  logger.fatal("[SYSTEM] [BOT] An error occurred while running bot:", err);
});
