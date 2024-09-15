import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('invites')
        .addColumn('is_reusable', 'boolean', (col) => col.defaultTo(false).notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {}
