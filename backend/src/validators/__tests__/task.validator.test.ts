import {
  priorityEnum,
  taskIdParamSchema,
  columnIdParamSchema,
  projectIdParamSchema,
  projectTaskIdParamSchema,
  listTasksQuerySchema,
  globalTasksQuerySchema,
  createTaskBodySchema,
  createTaskInProjectBodySchema,
  updateTaskBodySchema,
  moveTaskBodySchema,
  reorderTaskBodySchema,
  bulkDeleteBodySchema,
} from '../task.validator.js';

// ============ ENUMS ============

describe('priorityEnum', () => {
  it('accepts valid priority values', () => {
    expect(priorityEnum.safeParse('LOW').success).toBe(true);
    expect(priorityEnum.safeParse('MEDIUM').success).toBe(true);
    expect(priorityEnum.safeParse('HIGH').success).toBe(true);
  });

  it('rejects invalid priority values', () => {
    expect(priorityEnum.safeParse('URGENT').success).toBe(false);
    expect(priorityEnum.safeParse('low').success).toBe(false);
    expect(priorityEnum.safeParse('').success).toBe(false);
  });
});

// ============ PARAM SCHEMAS ============

describe('taskIdParamSchema', () => {
  it('accepts valid task ID', () => {
    const result = taskIdParamSchema.safeParse({ taskId: 'clx123abc' });
    expect(result.success).toBe(true);
  });

  it('rejects empty task ID', () => {
    const result = taskIdParamSchema.safeParse({ taskId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing task ID', () => {
    const result = taskIdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('columnIdParamSchema', () => {
  it('accepts valid column ID', () => {
    expect(columnIdParamSchema.safeParse({ columnId: 'col_123' }).success).toBe(true);
  });

  it('rejects empty column ID', () => {
    expect(columnIdParamSchema.safeParse({ columnId: '' }).success).toBe(false);
  });
});

describe('projectIdParamSchema', () => {
  it('accepts valid project ID', () => {
    expect(projectIdParamSchema.safeParse({ projectId: 'proj_123' }).success).toBe(true);
  });

  it('rejects empty project ID', () => {
    expect(projectIdParamSchema.safeParse({ projectId: '' }).success).toBe(false);
  });
});

describe('projectTaskIdParamSchema', () => {
  it('accepts valid project and task IDs', () => {
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

// ============ QUERY SCHEMAS ============

describe('listTasksQuerySchema', () => {
  it('accepts empty query (all optional)', () => {
    const result = listTasksQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid filters', () => {
    const result = listTasksQuerySchema.safeParse({
      includeDeleted: 'true',
      priority: 'HIGH',
      search: 'my task',
    });
    expect(result.success).toBe(true);
  });

  it('transforms includeDeleted string to boolean', () => {
    const result = listTasksQuerySchema.safeParse({ includeDeleted: 'true' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.includeDeleted).toBe(true);
    }
  });

  it('rejects search exceeding 200 chars', () => {
    const result = listTasksQuerySchema.safeParse({ search: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe('globalTasksQuerySchema', () => {
  it('accepts empty query (all have defaults)', () => {
    const result = globalTasksQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('all');
      expect(result.data.sortBy).toBe('dueDate');
      expect(result.data.sortOrder).toBe('asc');
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(0);
    }
  });

  it('accepts all valid filters', () => {
    const result = globalTasksQuerySchema.safeParse({
      status: 'active',
      priority: 'LOW',
      projectId: 'proj_123',
      assignedToMe: 'true',
      dueBefore: '2026-04-01T00:00:00.000Z',
      dueAfter: '2026-03-01T00:00:00.000Z',
      search: 'test',
      sortBy: 'priority',
      sortOrder: 'desc',
      limit: '20',
      offset: '10',
    });
    expect(result.success).toBe(true);
  });

  it('transforms assignedToMe string to boolean', () => {
    const result = globalTasksQuerySchema.safeParse({ assignedToMe: 'true' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.assignedToMe).toBe(true);
    }
  });

  it('transforms limit and offset from strings to numbers', () => {
    const result = globalTasksQuerySchema.safeParse({ limit: '25', offset: '5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(5);
    }
  });

  it('rejects limit over 100', () => {
    const result = globalTasksQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = globalTasksQuerySchema.safeParse({ status: 'pending' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sortBy', () => {
    const result = globalTasksQuerySchema.safeParse({ sortBy: 'name' });
    expect(result.success).toBe(false);
  });
});

// ============ BODY SCHEMAS ============

describe('createTaskBodySchema', () => {
  it('accepts valid input with all fields', () => {
    const result = createTaskBodySchema.safeParse({
      title: 'My Task',
      description: 'A description',
      priority: 'HIGH',
      dueDate: '2026-04-01T00:00:00.000Z',
      order: 0,
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal valid input (title only)', () => {
    const result = createTaskBodySchema.safeParse({ title: 'Task' });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createTaskBodySchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = createTaskBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 200 characters', () => {
    const result = createTaskBodySchema.safeParse({ title: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts title at exactly 200 characters', () => {
    const result = createTaskBodySchema.safeParse({ title: 'a'.repeat(200) });
    expect(result.success).toBe(true);
  });

  it('rejects description exceeding 5000 characters', () => {
    const result = createTaskBodySchema.safeParse({
      title: 'Task',
      description: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority value', () => {
    const result = createTaskBodySchema.safeParse({
      title: 'Task',
      priority: 'URGENT',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid dueDate format', () => {
    const result = createTaskBodySchema.safeParse({
      title: 'Task',
      dueDate: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty string for dueDate', () => {
    const result = createTaskBodySchema.safeParse({
      title: 'Task',
      dueDate: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative order', () => {
    const result = createTaskBodySchema.safeParse({
      title: 'Task',
      order: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('createTaskInProjectBodySchema', () => {
  it('accepts valid input with columnId', () => {
    const result = createTaskInProjectBodySchema.safeParse({
      title: 'My Task',
      columnId: 'col_123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing columnId', () => {
    const result = createTaskInProjectBodySchema.safeParse({
      title: 'My Task',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty columnId', () => {
    const result = createTaskInProjectBodySchema.safeParse({
      title: 'My Task',
      columnId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTaskBodySchema', () => {
  it('accepts empty body (all fields optional)', () => {
    const result = updateTaskBodySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with title only', () => {
    const result = updateTaskBodySchema.safeParse({ title: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('accepts null for nullable fields', () => {
    const result = updateTaskBodySchema.safeParse({
      description: null,
      priority: null,
      dueDate: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts completed boolean', () => {
    const result = updateTaskBodySchema.safeParse({ completed: true });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = updateTaskBodySchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });
});

describe('moveTaskBodySchema', () => {
  it('accepts valid move input', () => {
    const result = moveTaskBodySchema.safeParse({
      targetColumnId: 'col_456',
      order: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing targetColumnId', () => {
    const result = moveTaskBodySchema.safeParse({ order: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative order', () => {
    const result = moveTaskBodySchema.safeParse({
      targetColumnId: 'col_456',
      order: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing order', () => {
    const result = moveTaskBodySchema.safeParse({ targetColumnId: 'col_456' });
    expect(result.success).toBe(false);
  });
});

describe('reorderTaskBodySchema', () => {
  it('accepts valid order', () => {
    const result = reorderTaskBodySchema.safeParse({ order: 3 });
    expect(result.success).toBe(true);
  });

  it('accepts order of 0', () => {
    const result = reorderTaskBodySchema.safeParse({ order: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects negative order', () => {
    const result = reorderTaskBodySchema.safeParse({ order: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer order', () => {
    const result = reorderTaskBodySchema.safeParse({ order: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe('bulkDeleteBodySchema', () => {
  it('accepts valid task IDs array', () => {
    const result = bulkDeleteBodySchema.safeParse({
      taskIds: ['task_1', 'task_2', 'task_3'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty array', () => {
    const result = bulkDeleteBodySchema.safeParse({ taskIds: [] });
    expect(result.success).toBe(false);
  });

  it('rejects array exceeding 50 items', () => {
    const taskIds = Array.from({ length: 51 }, (_, i) => `task_${i}`);
    const result = bulkDeleteBodySchema.safeParse({ taskIds });
    expect(result.success).toBe(false);
  });

  it('accepts array at exactly 50 items', () => {
    const taskIds = Array.from({ length: 50 }, (_, i) => `task_${i}`);
    const result = bulkDeleteBodySchema.safeParse({ taskIds });
    expect(result.success).toBe(true);
  });

  it('rejects empty string in task IDs', () => {
    const result = bulkDeleteBodySchema.safeParse({ taskIds: [''] });
    expect(result.success).toBe(false);
  });
});
