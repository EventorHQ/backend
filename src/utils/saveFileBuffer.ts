import { InputFile } from 'grammy';
import { bot } from '../bot/index.js';
import { WISHYOUDIE_TGID } from '../config/config.js';
import { getFileId } from './getFileId.js';

export async function saveFileBuffer(buffer: Buffer) {
    const response = await bot.api.sendPhoto(WISHYOUDIE_TGID, new InputFile(buffer));
    return getFileId(response);
}
