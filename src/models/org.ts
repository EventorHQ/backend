import z from 'zod';
import { HasCreatedAt, HasID } from './shared';

export const BaseOrg = z.object({
    title: z.string(),
    description: z.string().nullable().optional()
});

export const Org = BaseOrg.merge(HasID).merge(HasCreatedAt);
