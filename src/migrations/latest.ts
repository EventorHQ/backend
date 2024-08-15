import * as path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { Migrator, FileMigrationProvider } from 'kysely';
import { createKysely } from '@vercel/postgres-kysely';

import { Database } from '../db/types';
import { POSTGRES_URL } from '../config/config';

async function migrateToLatest() {
    const db = createKysely<Database>({
        connectionString: POSTGRES_URL
    });

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(path.dirname(fileURLToPath(import.meta.url)), '../migrations')
        })
    });

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration "${it.migrationName}" was executed successfully`);
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`);
        }
    });

    if (error) {
        console.error('failed to migrate');
        console.error(error);
        process.exit(1);
    }

    await db.destroy();
}

migrateToLatest();
