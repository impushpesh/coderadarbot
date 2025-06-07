import { Telegraf } from "telegraf";
import chalk from "chalk";
import dotenv from "dotenv";
import connectDB from "./lib/connection.js";
import { registerCommands } from "./commands/index.js";

dotenv.config();

await connectDB(); 

const bot = new Telegraf(process.env.BOT_TOKEN);

registerCommands(bot);

// Bot launch
bot.launch();
console.log(chalk.green("[INFO] Bot is running..."));

bot.catch((err) => {
  console.error(chalk.red("[FATAL] Error occurred:"), err);
});
