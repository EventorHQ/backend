import { z } from 'zod';

export const eventCreateSchema = z.object({
    org_id: z.number(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    form: z.object({}).passthrough(),
    start_date: z.date(),
    end_date: z.date()
});

export type EventCreateData = z.infer<typeof eventCreateSchema>;

export const eventEnlistSchema = z.object({
    event_id: z.number(),
    user_id: z.number(),
    form: z.object({}).passthrough()
});

export type EventEnlistData = z.infer<typeof eventEnlistSchema>;
