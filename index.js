import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  console.dir(ctx.from, { depth: null });
  ctx.reply("Welcome to the bot! Use /help to see available commands.");
});

bot.launch();
console.log("Bot is running...");
bot.catch((err) => {
  console.error("Error occurred:", err);
});
