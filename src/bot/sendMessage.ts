import { Event } from '../db/types.js';
import { bot } from './index.js';

export async function sendEventMessage(chatId: number, message: string, event: Event) {
    try {
        await bot.api.sendMessage(chatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Открыть',
                            url: `https://t.me/eventor_tgbot/app?startapp=${event.id}`
                        }
                    ]
                ]
            }
        });
    } catch (reason) {
        console.error(reason);
    }
}
