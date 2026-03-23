import {
  listLabelsSchema,
  createLabelSchema,
  getLabelSchema,
  updateLabelSchema,
  deleteLabelSchema,
  addTaskLabelSchema,
  removeTaskLabelSchema,
  setTaskLabelsSchema,
} from '../label.validator.js';

describe('listLabelsSchema', () => {
  it('accepts valid project ID', () => {
    const result = listLabelsSchema.safeParse({
      params: { projectId: 'proj_123' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty project ID', () => {
    const result = listLabelsSchema.safeParse({
      params: { projectId: '' },
    });
    expect(result.success).toBe(false);
  });
});

describe('createLabelSchema', () => {
  it('accepts valid label', () => {
    const result = createLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
      body: { name: 'Bug', color: '#FF0000' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
      body: { name: '', color: '#FF0000' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 50 characters', () => {
    const result = createLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
      body: { name: 'a'.repeat(51), color: '#FF0000' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid hex color', () => {
    const result = createLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
      body: { name: 'Bug', color: 'red' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects short hex color (#FFF)', () => {
    const result = createLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
      body: { name: 'Bug', color: '#FFF' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts lowercase hex color', () => {
    const result = createLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
      body: { name: 'Bug', color: '#aabbcc' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing color', () => {
    const result = createLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
      body: { name: 'Bug' },
    });
    expect(result.success).toBe(false);
  });
});

describe('getLabelSchema', () => {
  it('accepts valid params', () => {
    const result = getLabelSchema.safeParse({
      params: { projectId: 'proj_1', labelId: 'lbl_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty labelId', () => {
    const result = getLabelSchema.safeParse({
      params: { projectId: 'proj_1', labelId: '' },
    });
    expect(result.success).toBe(false);
  });
});

describe('updateLabelSchema', () => {
  it('accepts valid partial update', () => {
    const result = updateLabelSchema.safeParse({
      params: { projectId: 'proj_1', labelId: 'lbl_1' },
      body: { name: 'Feature' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty body (all optional)', () => {
    const result = updateLabelSchema.safeParse({
      params: { projectId: 'proj_1', labelId: 'lbl_1' },
      body: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts color-only update', () => {
    const result = updateLabelSchema.safeParse({
      params: { projectId: 'proj_1', labelId: 'lbl_1' },
      body: { color: '#00FF00' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid color in update', () => {
    const result = updateLabelSchema.safeParse({
      params: { projectId: 'proj_1', labelId: 'lbl_1' },
      body: { color: 'not-hex' },
    });
    expect(result.success).toBe(false);
  });
});

describe('deleteLabelSchema', () => {
  it('accepts valid params', () => {
    const result = deleteLabelSchema.safeParse({
      params: { projectId: 'proj_1', labelId: 'lbl_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing labelId', () => {
    const result = deleteLabelSchema.safeParse({
      params: { projectId: 'proj_1' },
    });
    expect(result.success).toBe(false);
  });
});

describe('addTaskLabelSchema', () => {
  it('accepts valid input', () => {
    const result = addTaskLabelSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { labelId: 'lbl_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty labelId', () => {
    const result = addTaskLabelSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { labelId: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing labelId', () => {
    const result = addTaskLabelSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('removeTaskLabelSchema', () => {
  it('accepts valid params', () => {
    const result = removeTaskLabelSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1', labelId: 'lbl_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing labelId', () => {
    const result = removeTaskLabelSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
    });
    expect(result.success).toBe(false);
  });
});

describe('setTaskLabelsSchema', () => {
  it('accepts valid label IDs array', () => {
    const result = setTaskLabelsSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { labelIds: ['lbl_1', 'lbl_2'] },
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty array (removes all labels)', () => {
    const result = setTaskLabelsSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { labelIds: [] },
    });
    expect(result.success).toBe(true);
  });

  it('defaults to empty array when labelIds not provided', () => {
    const result = setTaskLabelsSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: {},
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.labelIds).toEqual([]);
    }
  });
});
