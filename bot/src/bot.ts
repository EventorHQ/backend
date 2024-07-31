import { Bot } from "grammy";
import { BOT_TOKEN } from "./config/config";

const bot = new Bot(BOT_TOKEN);

bot.on("message", (ctx) => ctx.reply("Hi there!"));

console.log("Bot started");
bot.start();
