import pg from 'pg';
import { DB } from '../config/config.js';
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from './types.js';

export const pool = new pg.Pool({
    user: DB.USER,
    host: DB.HOST,
    database: DB.NAME,
    password: DB.PASSWORD,
    port: DB.PORT
});

const dialect = new PostgresDialect({ pool: pool });
export const db = new Kysely<Database>({ dialect });
