import {
  projectIdParamSchema,
  taskIdParamSchema,
  projectTaskIdParamSchema,
  paginationQuerySchema,
  listProjectActivitiesSchema,
  listTaskActivitiesSchema,
  listUserActivitiesSchema,
} from '../activity.validator.js';

// ============ PARAM SCHEMAS ============

describe('projectIdParamSchema (activity)', () => {
  it('accepts valid project ID', () => {
    const result = projectIdParamSchema.safeParse({ projectId: 'proj_123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty project ID', () => {
    const result = projectIdParamSchema.safeParse({ projectId: '' });
    expect(result.success).toBe(false);
  });
});

describe('taskIdParamSchema (activity)', () => {
  it('accepts valid task ID', () => {
    const result = taskIdParamSchema.safeParse({ taskId: 'task_123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty task ID', () => {
    const result = taskIdParamSchema.safeParse({ taskId: '' });
    expect(result.success).toBe(false);
  });
});

describe('projectTaskIdParamSchema (activity)', () => {
  it('accepts valid params', () => {
    const result = projectTaskIdParamSchema.safeParse({
      projectId: 'proj_1',
      taskId: 'task_1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing taskId', () => {
    const result = projectTaskIdParamSchema.safeParse({ projectId: 'proj_1' });
    expect(result.success).toBe(false);
  });
});

// ============ PAGINATION ============

describe('paginationQuerySchema', () => {
  it('accepts empty query (uses defaults)', () => {
    const result = paginationQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(0);
    }
  });

  it('accepts valid limit and offset', () => {
    const result = paginationQuerySchema.safeParse({ limit: '50', offset: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(10);
    }
  });

  it('transforms string limit to number', () => {
    const result = paginationQuerySchema.safeParse({ limit: '25' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });

  it('rejects limit below 1', () => {
    const result = paginationQuerySchema.safeParse({ limit: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 100', () => {
    const result = paginationQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('rejects negative offset', () => {
    const result = paginationQuerySchema.safeParse({ offset: '-1' });
    expect(result.success).toBe(false);
  });
});

// ============ COMBINED SCHEMAS ============

describe('listProjectActivitiesSchema', () => {
  it('accepts valid input', () => {
    const result = listProjectActivitiesSchema.safeParse({
      params: { projectId: 'proj_1' },
      query: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts with pagination', () => {
    const result = listProjectActivitiesSchema.safeParse({
      params: { projectId: 'proj_1' },
      query: { limit: '10', offset: '20' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId', () => {
    const result = listProjectActivitiesSchema.safeParse({
      params: { projectId: '' },
      query: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('listTaskActivitiesSchema', () => {
  it('accepts valid input', () => {
    const result = listTaskActivitiesSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      query: {},
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing taskId', () => {
    const result = listTaskActivitiesSchema.safeParse({
      params: { projectId: 'proj_1' },
      query: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('listUserActivitiesSchema', () => {
  it('accepts empty query', () => {
    const result = listUserActivitiesSchema.safeParse({ query: {} });
    expect(result.success).toBe(true);
  });

  it('accepts with pagination params', () => {
    const result = listUserActivitiesSchema.safeParse({
      query: { limit: '5', offset: '0' },
    });
    expect(result.success).toBe(true);
  });
});
