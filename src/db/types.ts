import { ColumnType, Generated, Selectable } from 'kysely';

export const orgMemberRoles = ['admin', 'moderator', 'member'] as const;
export type OrgMemberRole = (typeof orgMemberRoles)[number];

export interface Database {
    users: UsersTable;
    orgs: OrgsTable;
    org_members: OrgMembersTable;
    invites: InvitesTable;
    events: EventsTable;
    event_visitors: EventVisitorsTable;
}

export interface UsersTable {
    id: ColumnType<number, number, never>;
    first_name: string;
    last_name: string | null;
    username: string | null;
    photo_img: string | null;
    is_admin: boolean;
    created_at: Generated<Date>;
}

export type User = Selectable<UsersTable>;

export interface OrgsTable {
    id: Generated<number>;
    creator_id: number;
    title: string;
    description: string | null;
    avatar_img: string;
    is_fancy: boolean;
    created_at: Generated<Date>;
}

export type Org = Selectable<OrgsTable>;

export interface OrgMembersTable {
    id: Generated<number>;
    org_id: number;
    user_id: number;
    role: OrgMemberRole;
    created_at: Generated<Date>;
}

export interface InvitesTable {
    id: string;
    org_id: number;
    inviter_id: number;
    role: OrgMemberRole;
    is_reusable: boolean;
}

export type Invite = Selectable<InvitesTable>;

export interface EventsTable {
    id: Generated<number>;
    org_id: number;
    creator_id: number;
    title: string;
    description: string;
    cover_img: string;
    location: string;
    start_date: Date;
    end_date: Date;
    form: unknown;
    created_at: Generated<Date>;
}

export type Event = Selectable<EventsTable>;

export interface EventVisitorsTable {
    id: Generated<number>;
    event_id: number;
    user_id: number;
    form: unknown;
    check_in_date: Date | null;
    created_at: Generated<Date>;
}
