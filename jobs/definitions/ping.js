// ! This is for testing purpose
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import User from "../../models/user.model.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

export default function defineSendPing(agenda) {
  agenda.define("send_ping", async () => {
    try {
      const users = await User.find({}, "telegramId");

      for (const user of users) {
        try {
          await bot.telegram.sendMessage(user.telegramId, "Global ping from Agenda every 5 seconds!");
          console.log("[INFO] Sent ping to", user.telegramId);
        } catch (err) {
          console.error(`[WARN] Failed to send ping to ${user.telegramId}:`, err.message);
        }
      }

    } catch (err) {
      console.error("[ERROR] Failed to fetch users or send pings:", err.message);
    }
  });
}
