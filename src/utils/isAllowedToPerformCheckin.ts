import { db } from '../db/index.js';

export async function isAllowedToPerformCheckin(eventId: number, userId: number) {
    const userOrgsMemberships = await db.selectFrom('org_members').where('user_id', '=', userId).selectAll().execute();

    if (userOrgsMemberships.length === 0) {
        return false;
    }

    const event = await db.selectFrom('events').where('id', '=', eventId).selectAll().executeTakeFirst();

    if (!event) {
        return false;
    }

    return userOrgsMemberships.some((userOrgsMembership) => userOrgsMembership.org_id === event.org_id);
}
