import * as z from 'zod';

export const createUrlSchema = z.object({
  originalUrl: z.string().url(),
});

export type CreateUrl = z.infer<typeof createUrlSchema>;
