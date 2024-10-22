import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('events')
        .alterColumn('end_date', (ac) => ac.dropNotNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('events')
        .alterColumn('end_date', (ac) => ac.setNotNull())
        .execute();
}
