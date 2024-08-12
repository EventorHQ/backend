import { db } from '.';
import { sql } from 'kysely';
import { Org, User } from './types';

export async function getUserById(id: number) {
    const result = await db.selectFrom('users').where('id', '=', id).selectAll().executeTakeFirst();

    if (!result) {
        return null;
    }

    return result;
}

export async function getOrgById(id: number) {
    const result = await db.selectFrom('orgs').where('id', '=', id).selectAll().executeTakeFirst();

    return result;
}

export async function getOrgMembersByOrgId(id: number) {
    const result = await db
        .selectFrom('org_members')
        .where('org_id', '=', id)
        .innerJoin('users', 'org_members.user_id', 'users.id')
        .select([
            'users.id',
            'users.first_name',
            'users.last_name',
            'users.username',
            'org_members.role',
            'users.photo_img',
            'org_members.created_at as member_since'
        ])
        .execute();

    return result;
}

export async function getOrgWithMembersById(id: number) {
    const result = await db
        .selectFrom('orgs')
        .select([
            'orgs.id',
            'orgs.title',
            'orgs.description',
            'orgs.avatar_img',
            'orgs.is_fancy',
            'orgs.created_at',
            sql<
                User[]
            >`json_agg(json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'username', u.username, 'photo_img', u.photo_img))`.as(
                'members'
            )
        ])
        .innerJoin('org_members', 'orgs.id', 'org_members.org_id')
        .innerJoin('users as u', 'u.id', 'org_members.user_id')
        .where('orgs.id', '=', id)
        .executeTakeFirst();

    return result;
}

export async function getUserOrganizations(userId: number) {
    const result = await db
        .selectFrom('org_members')
        .where('user_id', '=', userId)
        .select([
            'role',
            sql<Org>`json_build_object('id', org_id, 'title', title, 'description', description, 'avatar_img', avatar_img, 'is_fancy', is_fancy)`.as(
                'organization'
            )
        ])
        .innerJoin('orgs', 'org_members.org_id', 'orgs.id')
        .execute();

    return result;
}
