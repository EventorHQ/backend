import z from 'zod';

export const HasID = z.object({
    id: z.number()
});

export const HasCreatedAt = z.object({
    createdAt: z.date()
});
