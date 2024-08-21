import { db } from './index.js';
import { sql } from 'kysely';
import { Org, OrgMemberRole, User } from './types';
import { randomUUID } from 'crypto';
import { getPictureByFileId } from '../utils/getPictureByFileId.js';
import { EventCreateData } from '../models/event.js';

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
        .selectFrom('orgs as o')
        .where('o.id', '=', id)
        .select([
            'o.id',
            'o.title',
            'o.description',
            'o.avatar_img',
            'o.is_fancy',
            'o.created_at',
            sql<
                (User & { role: OrgMemberRole })[]
            >`json_agg(json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'username', u.username, 'photo_img', u.photo_img, 'role', org_members.role))`.as(
                'members'
            )
        ])
        .groupBy('o.id')
        .innerJoin('org_members', 'org_members.org_id', 'o.id')
        .innerJoin('users as u', 'u.id', 'org_members.user_id')
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

export async function addUserToOrg(userId: number, orgId: number, role: OrgMemberRole = 'member') {
    const existingEntry = await db.selectFrom('org_members').where('user_id', '=', userId).where('org_id', '=', orgId).selectAll().executeTakeFirst();

    if (existingEntry) {
        return { error: 'User already in this organization' };
    }

    return await db
        .insertInto('org_members')
        .values({
            org_id: orgId,
            user_id: userId,
            role: role
        })
        .returningAll()
        .executeTakeFirst();
}

export async function getInvite(id: string) {
    const result = await db
        .selectFrom('invites')
        .where('invites.id', '=', id)
        .select([
            'invites.id',
            'role',
            sql<User>`json_build_object('id', u.id,'first_name', u.first_name, 'last_name', u.last_name)`.as('inviter'),
            sql<Org>`json_build_object('id', o.id, 'title', o.title, 'avatar_img', o.avatar_img, 'is_fancy', o.is_fancy)`.as('org')
        ])
        .innerJoin('users as u', 'invites.inviter_id', 'u.id')
        .innerJoin('orgs as o', 'invites.org_id', 'o.id')
        .executeTakeFirst();

    if (!result) return null;

    const orgPhoto = await getPictureByFileId(result.org.avatar_img);
    result.org.avatar_img = orgPhoto;

    return result;
}

export async function createInvite(orgId: number, inviterId: number, role: OrgMemberRole = 'member') {
    return await db
        .insertInto('invites')
        .values({
            id: randomUUID(),
            org_id: orgId,
            inviter_id: inviterId,
            role: role
        })
        .returning('id')
        .executeTakeFirst();
}

export async function deleteOrganization(orgId: number) {
    await db.deleteFrom('org_members').where('org_id', '=', orgId).execute();
    await db.deleteFrom('invites').where('org_id', '=', orgId).execute();
    await db.deleteFrom('orgs').where('id', '=', orgId).execute();
}

export async function getAllEvents() {
    const result = await db.selectFrom('events').selectAll().execute();

    return result;
}

export async function getUserEvents(userId: number) {
    return [];
}

export async function createEvent(data: EventCreateData & { cover: string; creatorId: number }) {
    const result = await db
        .insertInto('events')
        .values({
            org_id: data.org_id,
            creator_id: data.creatorId,
            title: data.title,
            description: data.description,
            cover_img: data.cover,
            location: data.location,
            start_time: data.start_time,
            end_time: data.end_time,
            form: data.form
        })
        .returningAll()
        .executeTakeFirst();

    return result;
}
