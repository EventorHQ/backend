import dotenv from 'dotenv';

dotenv.config();

export const DEVELOPMENT = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

export const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 443;
export const SERVER_HOSTNAME = process.env.SERVER_HOST || '127.0.0.1';

export const SERVER = {
    PORT: SERVER_PORT,
    HOSTNAME: SERVER_HOSTNAME
};

// export const DB_HOST = process.env.DB_HOST || 'localhost';
// export const DB_PORT = process.env.DB_PORT ? +process.env.DB_PORT : 5432;
// export const DB_USER = process.env.DB_USER || 'postgres';
// export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
// export const DB_NAME = process.env.DB_NAME || 'eventor';
export const POSTGRES_URL = process.env.POSTGRES_URL;
export const POSTGRES_PRISMA_URL = process.env.POSTGRES_PRISMA_URL;
export const POSTGRES_URL_NO_SSL = process.env.POSTGRES_URL_NO_SSL;
export const POSTGRES_URL_NON_POOLING = process.env.POSTGRES_URL_NON_POOLING;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_HOST = process.env.POSTGRES_HOST;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE;

export const DB = {
    HOST: POSTGRES_HOST,
    USER: POSTGRES_USER,
    PASSWORD: POSTGRES_PASSWORD,
    NAME: POSTGRES_DATABASE,
    URL: POSTGRES_URL
};

export const BOT_TOKEN = process.env.BOT_TOKEN || '';

export const WISHYOUDIE_TGID = 384323500;
