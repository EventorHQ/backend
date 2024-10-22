import { z } from 'zod';

const eventFormFieldSchema = z.object({
    type: z.enum(['text', 'wallet']),
    label: z.string(),
    required: z.boolean()
});

export const eventCreateSchema = z.object({
    org_id: z.number(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    form: z.array(eventFormFieldSchema),
    start_date: z.date(),
    end_date: z.date().nullable()
});

export type EventCreateData = Omit<z.infer<typeof eventCreateSchema>, 'form'> & { form: { fields: z.infer<typeof eventFormFieldSchema>[] } };

export const eventEnlistSchema = z.object({
    event_id: z.number(),
    user_id: z.number(),
    form: z.object({}).passthrough()
});

export type EventEnlistData = z.infer<typeof eventEnlistSchema>;
