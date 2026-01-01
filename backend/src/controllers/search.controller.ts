import type { Request, Response } from 'express';
import * as searchService from '../services/search.service.js';
import type { SearchQueryInput } from '../validators/search.validator.js';

/**
 * Search tasks and projects.
 * GET /api/v1/search?q=query&projectId=optional&limit=10
 */
export async function search(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const query = req.query as unknown as SearchQueryInput;

    const results = await searchService.search(userId, query);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Failed to perform search',
      },
    });
  }
}
