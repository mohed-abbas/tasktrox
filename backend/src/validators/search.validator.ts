import { z } from 'zod';

// Search query params schema
export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
    projectId: z.string().uuid('Invalid project ID').optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val >= 1 && val <= 50, 'Limit must be between 1 and 50'),
  }),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>['query'];
