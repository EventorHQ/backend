import { bot } from '../bot/index.js';
import { SERVER } from '../config/config.js';

export async function getPictureByFileId(fileId: string) {
    try {
        const response = await bot.api.getFile(fileId);
        return `${SERVER.HOSTNAME}/botapi/${response.file_path}`;
    } catch (reason) {
        logging.error('Error getting picture by file id:', JSON.stringify(reason));
        return '';
    }
}
