import { ColumnType, Generated, Selectable } from 'kysely';

export type OrgMemberRole = 'admin' | 'moderator' | 'member';

export interface Database {
    users: UsersTable;
    orgs: OrgsTable;
    org_members: OrgMembersTable;
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
