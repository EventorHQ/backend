import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('invites')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('org_id', 'integer', (col) => col.notNull())
        .addColumn('inviter_id', 'bigint', (col) => col.notNull())
        .addColumn('role', 'text', (col) => col.notNull())
        .execute();

    await db.schema.alterTable('invites').addForeignKeyConstraint('org_id', ['org_id'], 'orgs', ['id']).execute();
    await db.schema.alterTable('invites').addForeignKeyConstraint('inviter_id', ['inviter_id'], 'users', ['id']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('invites').execute();
}
