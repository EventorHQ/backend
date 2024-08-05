import { bot } from '../bot';

export async function getPictureByFileId(fileId: string) {
    const response = await bot.api.getFile(fileId);
    return response.file_path;
}
