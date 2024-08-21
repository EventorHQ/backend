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
