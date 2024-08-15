import pg from 'pg';
import { DB } from '../config/config.js';
import { Kysely, PostgresDialect } from 'kysely';
import { createKysely } from '@vercel/postgres-kysely';
import type { Database } from './types.js';

// export const pool = new pg.Pool({
//     connectionString: DB.URL
// });

// const dialect = new PostgresDialect({ pool: pool });
// export const db = new Kysely<Database>({ dialect });

export const db = createKysely<Database>();
