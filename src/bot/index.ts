import { Bot } from 'grammy';
import { BOT_TOKEN, SERVER } from '../config/config';

export const createBot = () => {
    const bot = new Bot(BOT_TOKEN);
    return bot;
};

export const setupWebhook = async (bot: Bot) => {
    const webhookInfo = await bot.api.getWebhookInfo();
    if (!webhookInfo.url) {
        await bot.api.setWebhook(`${SERVER.HOSTNAME}:${SERVER.PORT}/bot`);
    }
};
