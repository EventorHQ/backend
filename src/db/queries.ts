import { db } from './index.js';
import { sql } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';
import { Event, Org, OrgMemberRole, User } from './types';
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
    return await db
        .insertInto('org_members')
        .values({
            org_id: orgId,
            user_id: userId,
            role: role
        })
        .onConflict((oc) => oc.columns(['org_id', 'user_id']).doUpdateSet({ role }))
        .returningAll()
        .executeTakeFirst();
}

export async function getUserOrgRole(userId: number, orgId: number) {
    const result = await db.selectFrom('org_members').where('user_id', '=', userId).where('org_id', '=', orgId).select('role').executeTakeFirst();
    return result?.role;
}

export async function deleteUserFromOrg(userId: number, orgId: number) {
    return await db.deleteFrom('org_members').where('user_id', '=', userId).where('org_id', '=', orgId).executeTakeFirst();
}

export async function deleteUser(userId: number) {
    await db.deleteFrom('org_members').where('user_id', '=', userId).execute();
    await db.deleteFrom('invites').where('inviter_id', '=', userId).execute();
    await db.deleteFrom('event_visitors').where('user_id', '=', userId).execute();
    await db.deleteFrom('events').where('creator_id', '=', userId).execute();
    return await db.deleteFrom('users').where('id', '=', userId).returningAll().executeTakeFirst();
}

export async function getInvite(id: string) {
    const result = await db
        .selectFrom('invites')
        .where('invites.id', '=', id)
        .select([
            'invites.id',
            'role',
            'is_reusable',
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

export async function getOrgInvitations(orgId: number) {
    const result = await db.selectFrom('invites').where('org_id', '=', orgId).selectAll().execute();
    return result;
}

export async function createInvite(orgId: number, inviterId: number, role: OrgMemberRole = 'member', isReusable: boolean = false) {
    return await db
        .insertInto('invites')
        .values({
            id: randomUUID(),
            org_id: orgId,
            inviter_id: inviterId,
            role: role,
            is_reusable: isReusable
        })
        .returning('id')
        .executeTakeFirst();
}

export async function deleteInvite(id: string) {
    return await db.deleteFrom('invites').where('id', '=', id).returningAll().executeTakeFirst();
}

export async function deleteOrganization(orgId: number) {
    await db.deleteFrom('events').where('org_id', '=', orgId).execute();
    await db.deleteFrom('org_members').where('org_id', '=', orgId).execute();
    await db.deleteFrom('invites').where('org_id', '=', orgId).execute();
    return await db.deleteFrom('orgs').where('id', '=', orgId).returningAll().executeTakeFirst();
}

export async function getAllEvents() {
    const result = await db.selectFrom('events').selectAll().execute();

    return result;
}

export async function getUserCreatedEvents(userId: number) {
    return await db.selectFrom('events').where('creator_id', '=', userId).selectAll().execute();
}

export async function getUserEvents(userId: number) {
    const visitorEventsQuery = db
        .selectFrom('events')
        .innerJoin('event_visitors', 'events.id', 'event_visitors.event_id')
        .select([
            'events.id as event_id',
            'events.creator_id',
            'events.title',
            'events.description',
            'events.cover_img',
            'events.location',
            'events.start_date',
            'events.end_date',
            'events.created_at',
            'events.form',
            sql<'creator' | 'visitor'>`'visitor'`.as('role')
        ])
        .where('event_visitors.user_id', '=', userId);

    const creatorEventsQuery = db
        .selectFrom('events')
        .select([
            'events.id as event_id',
            'events.creator_id',
            'events.title',
            'events.description',
            'events.cover_img',
            'events.location',
            'events.start_date',
            'events.end_date',
            'events.created_at',
            'events.form',
            sql<'creator' | 'visitor'>`'creator'`.as('role')
        ])
        .where('events.creator_id', '=', userId);

    const events = await db
        .selectFrom(visitorEventsQuery.union(creatorEventsQuery).as('user_events'))
        .selectAll()
        .orderBy('created_at', 'desc')
        .limit(10)
        .execute();

    return events;
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
            start_date: data.start_date,
            end_date: data.end_date,
            form: data.form
        })
        .returningAll()
        .executeTakeFirst();

    return result;
}

export async function updateEvent(id: number, data: EventCreateData & { cover?: string }) {
    return await db.updateTable('events').set(data).where('id', '=', id).returningAll().executeTakeFirst();
}

export async function deleteEvent(id: number) {
    await db.deleteFrom('event_visitors').where('event_id', '=', id).execute();
    return await db.deleteFrom('events').where('id', '=', id).returningAll().executeTakeFirst();
}

export async function enlist({ eventId, userId, form }: { eventId: number; userId: number; form: unknown }) {
    return await db
        .insertInto('event_visitors')
        .values({
            event_id: eventId,
            user_id: userId,
            form: form,
            check_in_date: null
        })
        .returningAll()
        .executeTakeFirst();
}

export async function getCheckinDataQuery(eventId: number, userId: number) {
    return await db.selectFrom('event_visitors').where('event_id', '=', eventId).where('user_id', '=', userId).selectAll().executeTakeFirst();
}

export async function checkin(eventId: number, userId: number) {
    return await db
        .updateTable('event_visitors')
        .set({ check_in_date: new Date() })
        .where('event_id', '=', eventId)
        .where('user_id', '=', userId)
        .returningAll()
        .executeTakeFirst();
}

export async function getEventById(id: number, userId: number) {
    const result = await db
        .selectFrom('events')
        .where('events.id', '=', id)
        .select([
            'events.id',
            'events.title',
            'events.description',
            'events.cover_img',
            'events.location',
            'events.start_date',
            'events.end_date',
            'events.created_at',
            'events.form',
            sql<Org>`json_build_object('id', o.id, 'title', o.title, 'is_fancy', o.is_fancy)`.as('org'),
            sql<'creator' | 'visitor' | 'seeker'>`
                CASE 
                    WHEN events.creator_id = ${userId} THEN 'creator'
                    WHEN EXISTS (
                        SELECT 1 FROM org_members 
                        WHERE org_members.org_id = events.org_id 
                        AND org_members.user_id = ${userId}
                    ) THEN 'creator'
                    WHEN EXISTS (
                        SELECT 1 FROM event_visitors 
                        WHERE event_visitors.event_id = events.id 
                        AND event_visitors.user_id = ${userId}
                    ) THEN 'visitor'
                    ELSE 'seeker'
                END
            `.as('role')
        ])
        .innerJoin('orgs as o', 'events.org_id', 'o.id')
        .executeTakeFirst();

    if (!result) return null;

    const cover = await getPictureByFileId(result.cover_img);
    result.cover_img = cover;

    return result;
}

export async function getEventAdministrationDetails(id: number) {
    const result = await db
        .selectFrom('event_visitors')
        .innerJoin('users', 'event_visitors.user_id', 'users.id')
        .innerJoin('events', 'event_visitors.event_id', 'events.id')
        .where('event_visitors.event_id', '=', id)
        .select(({ fn }) => [
            'events.id',
            'events.start_date',
            fn.countAll().over().as('total_visitors'),
            fn.count('check_in_date').over().as('total_checked_in_visitors'),
            fn.jsonAgg('users').over().as('all_visitors'),
            fn.jsonAgg('users').filterWhere('event_visitors.check_in_date', 'is not', null).over().as('checked_in_visitors')
        ])
        .executeTakeFirst();

    return result;
}
