import { Telegraf } from "telegraf";
import dotenv from "dotenv";
dotenv.config();

import User from "../../models/user.model.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

const sendPing = (agenda) => {
  agenda.define("send_ping", async () => {
    try {
      const users = await User.find({}, "telegramId"); 

      for (const user of users) {
        try {
          await bot.telegram.sendMessage(user.telegramId, "Global ping from Agenda every 5 seconds!");
          console.log("Sent to", user.telegramId);
        } catch (err) {
          console.error(`Failed for ${user.telegramId}:`, err.message);
        }
      }

    } catch (err) {
      console.error("Error fetching users or sending pings:", err.message);
    }
  });
}

export default sendPing;