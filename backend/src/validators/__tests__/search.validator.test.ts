import { searchQuerySchema } from '../search.validator.js';

describe('searchQuerySchema', () => {
  it('accepts valid search query', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: 'my task' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts query with all optional fields', () => {
    const result = searchQuerySchema.safeParse({
      query: {
        q: 'my task',
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        limit: '25',
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(25);
    }
  });

  it('provides default limit of 10', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: 'test' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(10);
    }
  });

  it('rejects empty search query', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing search query', () => {
    const result = searchQuerySchema.safeParse({
      query: {},
    });
    expect(result.success).toBe(false);
  });

  it('rejects query exceeding 100 characters', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: 'a'.repeat(101) },
    });
    expect(result.success).toBe(false);
  });

  it('accepts query at exactly 100 characters', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: 'a'.repeat(100) },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID for projectId', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: 'test', projectId: 'not-a-uuid' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects limit below 1', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: 'test', limit: '0' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 50', () => {
    const result = searchQuerySchema.safeParse({
      query: { q: 'test', limit: '51' },
    });
    expect(result.success).toBe(false);
  });
});
