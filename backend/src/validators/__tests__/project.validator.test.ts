import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
} from '../project.validator.js';

// ============ PROJECT SCHEMAS ============

describe('createProjectSchema', () => {
  it('accepts valid input with all fields', () => {
    const result = createProjectSchema.safeParse({
      body: {
        name: 'My Project',
        description: 'A description',
        color: '#FF5733',
        icon: 'rocket',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal input (name only)', () => {
    const result = createProjectSchema.safeParse({
      body: { name: 'My Project' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createProjectSchema.safeParse({
      body: { name: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = createProjectSchema.safeParse({
      body: {},
    });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 100 characters', () => {
    const result = createProjectSchema.safeParse({
      body: { name: 'a'.repeat(101) },
    });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding 500 characters', () => {
    const result = createProjectSchema.safeParse({
      body: { name: 'Project', description: 'a'.repeat(501) },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid hex color', () => {
    const result = createProjectSchema.safeParse({
      body: { name: 'Project', color: 'red' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid hex color', () => {
    const result = createProjectSchema.safeParse({
      body: { name: 'Project', color: '#6366f1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects icon exceeding 50 characters', () => {
    const result = createProjectSchema.safeParse({
      body: { name: 'Project', icon: 'a'.repeat(51) },
    });
    expect(result.success).toBe(false);
  });
});

describe('updateProjectSchema', () => {
  it('accepts valid partial update', () => {
    const result = updateProjectSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { name: 'Updated Name' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty body (all fields optional)', () => {
    const result = updateProjectSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts null for nullable fields', () => {
    const result = updateProjectSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { description: null, icon: null },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId in params', () => {
    const result = updateProjectSchema.safeParse({
      params: { projectId: '' },
      body: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('projectIdParamSchema', () => {
  it('accepts valid project ID', () => {
    const result = projectIdParamSchema.safeParse({
      params: { projectId: 'proj_123' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty project ID', () => {
    const result = projectIdParamSchema.safeParse({
      params: { projectId: '' },
    });
    expect(result.success).toBe(false);
  });
});

// ============ MEMBER SCHEMAS ============

describe('addMemberSchema', () => {
  it('accepts valid input with default role', () => {
    const result = addMemberSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { email: 'user@example.com' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.role).toBe('MEMBER');
    }
  });

  it('accepts valid input with explicit role', () => {
    const result = addMemberSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { email: 'user@example.com', role: 'ADMIN' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = addMemberSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { email: 'not-an-email' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects OWNER role (not in enum)', () => {
    const result = addMemberSchema.safeParse({
      params: { projectId: 'proj_123' },
      body: { email: 'user@example.com', role: 'OWNER' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid roles', () => {
    for (const role of ['ADMIN', 'MEMBER', 'VIEWER']) {
      const result = addMemberSchema.safeParse({
        params: { projectId: 'proj_123' },
        body: { email: 'user@example.com', role },
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateMemberRoleSchema', () => {
  it('accepts valid role update', () => {
    const result = updateMemberRoleSchema.safeParse({
      params: { projectId: 'proj_1', userId: 'user_1' },
      body: { role: 'ADMIN' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing role', () => {
    const result = updateMemberRoleSchema.safeParse({
      params: { projectId: 'proj_1', userId: 'user_1' },
      body: {},
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty userId', () => {
    const result = updateMemberRoleSchema.safeParse({
      params: { projectId: 'proj_1', userId: '' },
      body: { role: 'MEMBER' },
    });
    expect(result.success).toBe(false);
  });
});

describe('removeMemberSchema', () => {
  it('accepts valid params', () => {
    const result = removeMemberSchema.safeParse({
      params: { projectId: 'proj_1', userId: 'user_1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing userId', () => {
    const result = removeMemberSchema.safeParse({
      params: { projectId: 'proj_1' },
    });
    expect(result.success).toBe(false);
  });
});
