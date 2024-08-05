import { InputFile } from 'grammy';
import { bot } from '../bot';
import { WISHYOUDIE_TGID } from '../config/config';
import { getFileId } from './getFileId';

export async function saveFileBuffer(buffer: Buffer) {
    const response = await bot.api.sendPhoto(WISHYOUDIE_TGID, new InputFile(buffer));
    return getFileId(response);
}
