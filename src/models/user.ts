import z from 'zod';
import { HasCreatedAt, HasID } from './shared';

export const BaseUser = z.object({
    firstName: z.string(),
    lastName: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    isAdmin: z.boolean().optional()
});

export const User = BaseUser.merge(HasID).merge(HasCreatedAt);
