import z from 'zod';
import { HasCreatedAt, HasID } from './shared.js';

export const BaseUser = z.object({
    firstName: z.string(),
    lastName: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    isAdmin: z.boolean().optional()
});

export const PostUser = BaseUser.merge(HasID);
export type PostUserType = z.infer<typeof PostUser>;

export const User = BaseUser.merge(HasID).merge(HasCreatedAt);
