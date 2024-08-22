import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('event_visitors')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('event_id', 'integer', (col) => col.notNull())
        .addColumn('user_id', 'bigint', (col) => col.notNull())
        .addColumn('form', 'jsonb', (col) => col.notNull())
        .addColumn('check_in_date', 'timestamp')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    await db.schema.alterTable('event_visitors').addForeignKeyConstraint('event_id', ['event_id'], 'events', ['id']).execute();
    await db.schema.alterTable('event_visitors').addForeignKeyConstraint('user_id', ['user_id'], 'users', ['id']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('event_visitors').execute();
}
