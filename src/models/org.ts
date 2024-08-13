import z from 'zod';
import { HasCreatedAt, HasID } from './shared.js';

export const BaseOrg = z.object({
    title: z.string(),
    description: z.string().nullable().optional()
});

export const PostOrg = BaseOrg.extend({
    creatorId: z.number()
});

export const PatchOrg = z.object({
    title: z.string().optional(),
    description: z.string().optional()
});

export const Org = BaseOrg.merge(
    z.object({
        creatorId: z.number(),
        avatar: z.string().nullable().optional(),
        isFancy: z.boolean()
    })
)
    .merge(HasID)
    .merge(HasCreatedAt);

export type Org = z.infer<typeof Org>;
