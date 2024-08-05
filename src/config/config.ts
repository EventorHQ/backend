import dotenv from 'dotenv';

dotenv.config();

export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

export const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 443;
export const SERVER_HOSTNAME = process.env.SERVER_HOST || '127.0.0.1';

export const SERVER = {
    PORT: SERVER_PORT,
    HOSTNAME: SERVER_HOSTNAME
};

export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT ? +process.env.DB_PORT : 5432;
export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_NAME = process.env.DB_NAME || 'eventor';

export const DB = {
    HOST: DB_HOST,
    PORT: DB_PORT,
    USER: DB_USER,
    PASSWORD: DB_PASSWORD,
    NAME: DB_NAME
};

export const BOT_TOKEN = process.env.BOT_TOKEN || '';

export const WISHYOUDIE_TGID = 384323500;
