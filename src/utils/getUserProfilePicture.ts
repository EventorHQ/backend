import { User } from '../db/types';
import { getPictureByFileId } from './getPictureByFileId.js';

export async function getUserProfilePicture(user: User) {
    if (user.username) {
        return `https://t.me/i/userpic/320/${user.username}.jpg`;
    }

    if (user.photo_img) {
        return getPictureByFileId(user.photo_img);
    }

    return null;
}
