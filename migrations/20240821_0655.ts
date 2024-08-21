import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('events')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('org_id', 'integer', (col) => col.notNull())
        .addColumn('creator_id', 'bigint', (col) => col.notNull())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('cover_img', 'text', (col) => col.notNull())
        .addColumn('start_date', 'timestamp', (col) => col.notNull())
        .addColumn('end_date', 'timestamp', (col) => col.notNull())
        .addColumn('location', 'text', (col) => col.notNull())
        .addColumn('form', 'jsonb', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    await db.schema.alterTable('events').addForeignKeyConstraint('org_id', ['org_id'], 'orgs', ['id']).execute();
    await db.schema.alterTable('events').addForeignKeyConstraint('creator_id', ['creator_id'], 'users', ['id']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('events').execute();
}
