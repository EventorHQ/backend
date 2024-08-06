import { bot } from '../bot/index.js';

export async function getPictureByFileId(fileId: string) {
    const response = await bot.api.getFile(fileId);
    return response.file_path;
}
