import { bot } from '../bot/index.js';
import { SERVER } from '../config/config.js';

export async function getPictureByFileId(fileId: string) {
    const response = await bot.api.getFile(fileId);
    return `${SERVER.HOSTNAME}:${SERVER.PORT}/botapi/${response.file_path}`;
}
