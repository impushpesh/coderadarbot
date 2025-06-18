import { Telegraf } from "telegraf";
import chalk from "chalk";
import dotenv from "dotenv";
import connectDB from "./lib/connection.js";
import { registerCommands } from "./commands/index.js";

// Import agenda and job definitions
import agenda from "./jobs/index.js";
import "./jobs/definitions/index.js"; // Import job definitions to register them

dotenv.config();

await connectDB(); 

const bot = new Telegraf(process.env.BOT_TOKEN);

registerCommands(bot);

// Bot launch
bot.launch();
console.log(chalk.green("[INFO] Bot is running..."));

// Agenda setup
// agenda.on("ready", async () => {
//   console.log(chalk.green("[INFO] Agenda is ready..."));
//   agenda.start();
//   await agenda.every("5 seconds", "send_ping");
// });

bot.catch((err) => {
  console.error(chalk.red("[FATAL] Error occurred:"), err);
});
