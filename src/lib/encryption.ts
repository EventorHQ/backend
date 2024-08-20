import crypto from 'node:crypto';
import { BOT_TOKEN } from '../config/config.js';

const SECRET = crypto.createHash('sha256').update(BOT_TOKEN).digest('hex').slice(0, 32);

function encrypt(jsonData: Record<string, unknown>) {
    const data = JSON.stringify(jsonData);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET), iv);

    return iv.toString('hex') + ':' + cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encryptedData: string) {
    const [iv, data] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET), Buffer.from(iv, 'hex'));

    return JSON.parse(decipher.update(data, 'hex', 'utf8') + decipher.final('utf8'));
}

export { encrypt, decrypt };
