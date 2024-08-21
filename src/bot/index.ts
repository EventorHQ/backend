import { Bot } from 'grammy';
import { BOT_TOKEN, DEVELOPMENT, SERVER } from '../config/config.js';

export const bot = new Bot(DEVELOPMENT ? `${process.env.LOCAL_BOT_TOKEN}` : BOT_TOKEN);

export const setupWebhook = async (bot: Bot) => {
    const webhookInfo = await bot.api.getWebhookInfo();
    if (!webhookInfo.url) {
        await bot.api.setWebhook(`${SERVER.HOSTNAME}:${SERVER.PORT}/bot`);
    }
};
