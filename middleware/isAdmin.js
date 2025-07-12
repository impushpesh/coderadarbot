import dotenv from "dotenv";
import logger from "../logger/logger.js";
dotenv.config();

const ADMIN_ID = Number(process.env.ADMIN_ID);

export async function isAdmin(ctx, next) {
  if (ctx.from?.id !== ADMIN_ID) {
    logger.warn(`[MIDDLEWARE] Unauthorized access attempt by user ID: ${ctx.from?.id}`);
    return ctx.reply("You are not authorized to use this command.");
  }

  await next(); 
}
