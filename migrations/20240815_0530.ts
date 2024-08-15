import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('users')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn('first_name', 'text', (col) => col.notNull())
        .addColumn('last_name', 'text')
        .addColumn('username', 'text')
        .addColumn('photo_img', 'text')
        .addColumn('is_admin', 'boolean', (col) => col.notNull().defaultTo(false))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    await db.schema
        .createTable('orgs')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('creator_id', 'bigint', (col) => col.notNull())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('avatar_img', 'text')
        .addColumn('is_fancy', 'boolean', (col) => col.notNull().defaultTo(false))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    await db.schema.alterTable('orgs').addForeignKeyConstraint('creator_id', ['creator_id'], 'users', ['id']).execute();

    await db.schema
        .createTable('org_members')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('org_id', 'integer', (col) => col.notNull())
        .addColumn('user_id', 'bigint', (col) => col.notNull())
        .addColumn('role', 'text', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    await db.schema.alterTable('org_members').addForeignKeyConstraint('org_id', ['org_id'], 'orgs', ['id']).execute();
    await db.schema.alterTable('org_members').addForeignKeyConstraint('user_id', ['user_id'], 'users', ['id']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('org_members').dropConstraint('org_id').execute();
    await db.schema.alterTable('org_members').dropConstraint('user_id').execute();
    await db.schema.dropTable('org_members').execute();
    await db.schema.alterTable('orgs').dropConstraint('creator_id').execute();
    await db.schema.dropTable('orgs').execute();
    await db.schema.dropTable('users').execute();
}
