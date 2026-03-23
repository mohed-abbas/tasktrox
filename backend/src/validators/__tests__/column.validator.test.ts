import {
  listColumnsSchema,
  createColumnSchema,
  updateColumnSchema,
  deleteColumnSchema,
  reorderColumnSchema,
  reorderProjectColumnSchema,
} from '../column.validator.js';

describe('listColumnsSchema', () => {
  it('accepts valid project ID', () => {
    const result = listColumnsSchema.safeParse({
      params: { projectId: 'proj_123' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty project ID', () => {
    const result = listColumnsSchema.safeParse({
      params: { projectId: '' },
    });
    expect(result.success).toBe(false);
  });
});

describe('createColumnSchema', () => {
  it('accepts valid input with all fields', () => {
    const result = createColumnSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { name: 'To Do', color: '#FF5733', order: 0 },
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal input (name only)', () => {
    const result = createColumnSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { name: 'To Do' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty column name', () => {
    const result = createColumnSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { name: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects column name exceeding 50 characters', () => {
    const result = createColumnSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { name: 'a'.repeat(51) },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid hex color', () => {
    const result = createColumnSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { name: 'Col', color: 'blue' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid hex color', () => {
    const result = createColumnSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { name: 'Col', color: '#aaBBcc' },
    });
    expect(result.success).toBe(true);
  });
});

describe('updateColumnSchema', () => {
  it('accepts valid partial update', () => {
    const result = updateColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: { name: 'Updated' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty body (all optional)', () => {
    const result = updateColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts null for color (nullable)', () => {
    const result = updateColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: { color: null },
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional projectId in params', () => {
    const result = updateColumnSchema.safeParse({
      params: { projectId: 'proj_1', columnId: 'col_1' },
      body: {},
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty columnId', () => {
    const result = updateColumnSchema.safeParse({
      params: { columnId: '' },
      body: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('deleteColumnSchema', () => {
  it('accepts valid columnId', () => {
    const result = deleteColumnSchema.safeParse({
      params: { columnId: 'col_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty columnId', () => {
    const result = deleteColumnSchema.safeParse({
      params: { columnId: '' },
    });
    expect(result.success).toBe(false);
  });
});

describe('reorderColumnSchema', () => {
  it('accepts valid reorder input', () => {
    const result = reorderColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: { newOrder: 2 },
    });
    expect(result.success).toBe(true);
  });

  it('accepts order of 0', () => {
    const result = reorderColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: { newOrder: 0 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative order', () => {
    const result = reorderColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: { newOrder: -1 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing newOrder', () => {
    const result = reorderColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('reorderProjectColumnSchema', () => {
  it('accepts valid input', () => {
    const result = reorderProjectColumnSchema.safeParse({
      params: { projectId: 'proj_1', columnId: 'col_1' },
      body: { order: 3 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing projectId', () => {
    const result = reorderProjectColumnSchema.safeParse({
      params: { columnId: 'col_1' },
      body: { order: 0 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative order', () => {
    const result = reorderProjectColumnSchema.safeParse({
      params: { projectId: 'proj_1', columnId: 'col_1' },
      body: { order: -1 },
    });
    expect(result.success).toBe(false);
  });
});
