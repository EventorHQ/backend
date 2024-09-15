import { z } from 'zod';

export const invitationSchema = z.object({
    role: z.enum(['admin', 'moderator', 'member']),
    orgId: z.number(),
    isReusable: z.boolean().optional()
});
