import { InputFile } from 'grammy';
import { bot } from '../bot/index.js';
import { SERVICE_CHAT_ID, SERVICE_IMAGES_THREAD_ID } from '../config/config.js';
import { getFileId } from './getFileId.js';

export async function saveFileBuffer(buffer: Buffer) {
    const response = await bot.api.sendPhoto(SERVICE_CHAT_ID, new InputFile(buffer), {
        message_thread_id: SERVICE_IMAGES_THREAD_ID
    });
    return getFileId(response);
}
