import dotenv from "dotenv";
dotenv.config();

const ADMIN_ID = Number(process.env.ADMIN_ID);

export async function isAdmin(ctx, next) {
  if (ctx.from?.id !== ADMIN_ID) {
    return ctx.reply("You are not authorized to use this command.");
  }

  await next(); 
}
