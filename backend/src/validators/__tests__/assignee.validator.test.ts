import {
  assigneeParamsSchema,
  removeAssigneeParamsSchema,
  addAssigneeBodySchema,
  setAssigneesBodySchema,
  addAssigneeSchema,
  removeAssigneeSchema,
  getAssigneesSchema,
  setAssigneesSchema,
} from '../assignee.validator.js';

// ============ PARAM SCHEMAS ============

describe('assigneeParamsSchema', () => {
  it('accepts valid params', () => {
    const result = assigneeParamsSchema.safeParse({
      projectId: 'proj_1',
      taskId: 'task_1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId', () => {
    const result = assigneeParamsSchema.safeParse({
      projectId: '',
      taskId: 'task_1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty taskId', () => {
    const result = assigneeParamsSchema.safeParse({
      projectId: 'proj_1',
      taskId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('removeAssigneeParamsSchema', () => {
  it('accepts valid params', () => {
    const result = removeAssigneeParamsSchema.safeParse({
      projectId: 'proj_1',
      taskId: 'task_1',
      userId: 'user_1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing userId', () => {
    const result = removeAssigneeParamsSchema.safeParse({
      projectId: 'proj_1',
      taskId: 'task_1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty userId', () => {
    const result = removeAssigneeParamsSchema.safeParse({
      projectId: 'proj_1',
      taskId: 'task_1',
      userId: '',
    });
    expect(result.success).toBe(false);
  });
});

// ============ BODY SCHEMAS ============

describe('addAssigneeBodySchema', () => {
  it('accepts valid userId', () => {
    const result = addAssigneeBodySchema.safeParse({ userId: 'user_1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty userId', () => {
    const result = addAssigneeBodySchema.safeParse({ userId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing userId', () => {
    const result = addAssigneeBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('setAssigneesBodySchema', () => {
  it('accepts valid user IDs array', () => {
    const result = setAssigneesBodySchema.safeParse({
      userIds: ['user_1', 'user_2'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty array (remove all assignees)', () => {
    const result = setAssigneesBodySchema.safeParse({ userIds: [] });
    expect(result.success).toBe(true);
  });

  it('rejects array exceeding 20 items', () => {
    const userIds = Array.from({ length: 21 }, (_, i) => `user_${i}`);
    const result = setAssigneesBodySchema.safeParse({ userIds });
    expect(result.success).toBe(false);
  });

  it('accepts array at exactly 20 items', () => {
    const userIds = Array.from({ length: 20 }, (_, i) => `user_${i}`);
    const result = setAssigneesBodySchema.safeParse({ userIds });
    expect(result.success).toBe(true);
  });

  it('rejects empty string in user IDs', () => {
    const result = setAssigneesBodySchema.safeParse({ userIds: [''] });
    expect(result.success).toBe(false);
  });
});

// ============ COMBINED SCHEMAS ============

describe('addAssigneeSchema', () => {
  it('accepts valid combined input', () => {
    const result = addAssigneeSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { userId: 'user_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing body', () => {
    const result = addAssigneeSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
    });
    expect(result.success).toBe(false);
  });
});

describe('removeAssigneeSchema', () => {
  it('accepts valid params', () => {
    const result = removeAssigneeSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1', userId: 'user_1' },
    });
    expect(result.success).toBe(true);
  });
});

describe('getAssigneesSchema', () => {
  it('accepts valid params', () => {
    const result = getAssigneesSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
    });
    expect(result.success).toBe(true);
  });
});

describe('setAssigneesSchema', () => {
  it('accepts valid input', () => {
    const result = setAssigneesSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { userIds: ['user_1'] },
    });
    expect(result.success).toBe(true);
  });
});
