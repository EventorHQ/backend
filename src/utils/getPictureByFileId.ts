import { bot } from '../bot/index.js';
import { DEVELOPMENT, SERVER } from '../config/config.js';

export async function getPictureByFileId(fileId: string) {
    try {
        const response = await bot.api.getFile(fileId);
        return `${DEVELOPMENT && 'http://'}${SERVER.HOSTNAME}:${SERVER.PORT}/botapi/${response.file_path}`;
    } catch {
        return '';
    }
}
