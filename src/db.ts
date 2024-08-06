import { Pool } from 'pg';
import { DB } from './config/config.js';

export const db = new Pool({
    user: DB.USER,
    host: DB.HOST,
    database: DB.NAME,
    password: DB.PASSWORD,
    port: DB.PORT
});
