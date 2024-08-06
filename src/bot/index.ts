import { Bot } from 'grammy';
import { BOT_TOKEN, SERVER } from '../config/config.js';

export const bot = new Bot(BOT_TOKEN);

export const setupWebhook = async (bot: Bot) => {
    const webhookInfo = await bot.api.getWebhookInfo();
    if (!webhookInfo.url) {
        await bot.api.setWebhook(`${SERVER.HOSTNAME}:${SERVER.PORT}/bot`);
    }
};
