import {
  commentParamsSchema,
  commentIdParamsSchema,
  createCommentSchema,
  updateCommentSchema,
} from '../comment.validator.js';

describe('commentParamsSchema', () => {
  it('accepts valid params', () => {
    const result = commentParamsSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing taskId', () => {
    const result = commentParamsSchema.safeParse({
      params: { projectId: 'proj_1' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty projectId', () => {
    const result = commentParamsSchema.safeParse({
      params: { projectId: '', taskId: 'task_1' },
    });
    expect(result.success).toBe(false);
  });
});

describe('commentIdParamsSchema', () => {
  it('accepts valid params', () => {
    const result = commentIdParamsSchema.safeParse({
      params: { projectId: 'proj_1', commentId: 'com_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty commentId', () => {
    const result = commentIdParamsSchema.safeParse({
      params: { projectId: 'proj_1', commentId: '' },
    });
    expect(result.success).toBe(false);
  });
});

describe('createCommentSchema', () => {
  it('accepts valid comment', () => {
    const result = createCommentSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { content: 'This is a comment' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = createCommentSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { content: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 10000 characters', () => {
    const result = createCommentSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { content: 'a'.repeat(10001) },
    });
    expect(result.success).toBe(false);
  });

  it('accepts content at exactly 10000 characters', () => {
    const result = createCommentSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: { content: 'a'.repeat(10000) },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing content', () => {
    const result = createCommentSchema.safeParse({
      params: { projectId: 'proj_1', taskId: 'task_1' },
      body: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('updateCommentSchema', () => {
  it('accepts valid update', () => {
    const result = updateCommentSchema.safeParse({
      params: { projectId: 'proj_1', commentId: 'com_1' },
      body: { content: 'Updated comment' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = updateCommentSchema.safeParse({
      params: { projectId: 'proj_1', commentId: 'com_1' },
      body: { content: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 10000 characters', () => {
    const result = updateCommentSchema.safeParse({
      params: { projectId: 'proj_1', commentId: 'com_1' },
      body: { content: 'a'.repeat(10001) },
    });
    expect(result.success).toBe(false);
  });
});
