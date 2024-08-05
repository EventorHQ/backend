import { Message } from 'grammy/types';

export function getFileId(sendPhotoResponse: Message.PhotoMessage) {
    const photos = sendPhotoResponse.photo;
    const bestRes = photos[photos.length - 1];
    const id = bestRes.file_id;

    return id;
}
