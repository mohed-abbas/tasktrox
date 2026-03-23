import {
  globalFilesQuerySchema,
  globalFilesSchema,
  attachmentParamsSchema,
  attachmentIdParamsSchema,
  downloadParamsSchema,
} from '../attachment.validator.js';

// ============ GLOBAL FILES QUERY ============

describe('globalFilesQuerySchema', () => {
  it('accepts empty query (all have defaults)', () => {
    const result = globalFilesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('desc');
      expect(result.data.limit).toBe(100);
      expect(result.data.offset).toBe(0);
    }
  });

  it('accepts all valid filters', () => {
    const result = globalFilesQuerySchema.safeParse({
      search: 'report',
      type: 'documents',
      projectId: 'proj_123',
      dateFrom: '2026-01-01T00:00:00.000Z',
      dateTo: '2026-12-31T23:59:59.999Z',
      sortBy: 'size',
      sortOrder: 'asc',
      limit: '50',
      offset: '10',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all valid type values', () => {
    for (const type of ['images', 'documents', 'spreadsheets', 'archives', 'other']) {
      const result = globalFilesQuerySchema.safeParse({ type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid type', () => {
    const result = globalFilesQuerySchema.safeParse({ type: 'videos' });
    expect(result.success).toBe(false);
  });

  it('rejects search exceeding 200 characters', () => {
    const result = globalFilesQuerySchema.safeParse({ search: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('transforms limit from string to number', () => {
    const result = globalFilesQuerySchema.safeParse({ limit: '25' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });

  it('rejects limit above 100', () => {
    const result = globalFilesQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sortBy', () => {
    const result = globalFilesQuerySchema.safeParse({ sortBy: 'name' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid dateFrom format', () => {
    const result = globalFilesQuerySchema.safeParse({ dateFrom: 'not-a-date' });
    expect(result.success).toBe(false);
  });
});

describe('globalFilesSchema', () => {
  it('wraps query correctly', () => {
    const result = globalFilesSchema.safeParse({ query: {} });
    expect(result.success).toBe(true);
  });
});

// ============ PARAM SCHEMAS ============

describe('attachmentParamsSchema', () => {
  it('accepts valid params', () => {
    const result = attachmentParamsSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId', () => {
    const result = attachmentParamsSchema.safeParse({
      params: { projectId: '', taskId: 'task_1' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty taskId', () => {
    const result = attachmentParamsSchema.safeParse({
      params: { projectId: 'proj_1', taskId: '' },
    });
    expect(result.success).toBe(false);
  });
});

describe('attachmentIdParamsSchema', () => {
  it('accepts valid params', () => {
    const result = attachmentIdParamsSchema.safeParse({
      params: { projectId: 'proj_1', attachmentId: 'att_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty attachmentId', () => {
    const result = attachmentIdParamsSchema.safeParse({
      params: { projectId: 'proj_1', attachmentId: '' },
    });
    expect(result.success).toBe(false);
  });
});

describe('downloadParamsSchema', () => {
  it('accepts valid attachmentId', () => {
    const result = downloadParamsSchema.safeParse({
      params: { attachmentId: 'att_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty attachmentId', () => {
    const result = downloadParamsSchema.safeParse({
      params: { attachmentId: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing attachmentId', () => {
    const result = downloadParamsSchema.safeParse({
      params: {},
    });
    expect(result.success).toBe(false);
  });
});
