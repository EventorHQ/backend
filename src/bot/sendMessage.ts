import { Event } from '../db/types.js';
import { bot } from './index.js';

export async function sendEventMessage(chatId: number, message: string, event: Event) {
    await bot.api.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Открыть',
                        web_app: {
                            url: `https://t.me/eventor_tgbot/app?startapp=${event.id}`
                        }
                    }
                ]
            ]
        }
    });
}
