// Polling
// import { Telegraf } from "telegraf";
// import logger from "./logger/logger.js"
// import dotenv from "dotenv";
// import connectDB from "./lib/connection.js";
// import { registerCommands } from "./commands/index.js";


// dotenv.config();

// await connectDB(); 

// const bot = new Telegraf(process.env.BOT_TOKEN);

// registerCommands(bot);

// // Bot launch
// bot.launch();
// logger.debug("Bot is running...")


// bot.catch((err) => {
//   logger.fatal("[SYSTEM] [BOT] An error occurred while running bot:", err);
// });

//---------------------Webhook---------------------
import express from "express";
import { Telegraf } from "telegraf";
import logger from "./logger/logger.js";
import dotenv from "dotenv";
import connectDB from "./lib/connection.js";
import { registerCommands } from "./commands/index.js";

dotenv.config();
await connectDB();

const bot = new Telegraf(process.env.BOT_TOKEN);

registerCommands(bot);

const app = express();
const PORT = process.env.PORT || 3000;

const secretPath = `/telegraf/${process.env.BOT_TOKEN}`;

// Middleware to handle webhook updates from Telegram
app.use(bot.webhookCallback(secretPath));


// Start Express server
app.listen(PORT, async () => {
  try {
    const webhookUrl = `${process.env.WEBHOOK_URL}${secretPath}`;
    await bot.telegram.setWebhook(webhookUrl);

    logger.info(`[WEBHOOK] Webhook set to: ${webhookUrl}`);
    logger.info(`[SYSTEM] Server running on port ${PORT}`);
  } catch (err) {
    logger.error(`[WEBHOOK] Failed to set webhook: ${err.message}`);
  }
});

bot.catch((err) => {
  logger.fatal("[SYSTEM] [BOT] An error occurred while running bot:", err);
});
