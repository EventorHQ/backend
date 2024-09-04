import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('org_members').addUniqueConstraint('user_id-org_id', ['user_id', 'org_id']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('orgs').dropConstraint('user_id-org_id').execute();
}
