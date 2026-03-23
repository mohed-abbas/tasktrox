import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import type { User, Project, Column, Task, Label, Comment } from '@prisma/client';

// Low bcrypt rounds for test speed
const TEST_BCRYPT_ROUNDS = 4;
const DEFAULT_PASSWORD = 'TestPassword123!';

// ============ AUTH HELPERS ============

/**
 * Create a JWT access token for use in supertest route tests.
 * Uses jsonwebtoken directly to avoid importing AuthService (which cascades to Redis/env).
 */
export function createAuthToken(user: { id: string; email: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

// ============ USER FACTORY ============

interface CreateTestUserOverrides {
  email?: string;
  name?: string;
  password?: string;
  avatar?: string | null;
  provider?: string | null;
  providerId?: string | null;
}

export async function createTestUser(
  overrides: CreateTestUserOverrides = {}
): Promise<User> {
  const hashedPassword = await bcrypt.hash(
    overrides.password ?? DEFAULT_PASSWORD,
    TEST_BCRYPT_ROUNDS
  );

  return prisma.user.create({
    data: {
      email: overrides.email ?? faker.internet.email(),
      name: overrides.name ?? faker.person.fullName(),
      password: hashedPassword,
      avatar: overrides.avatar ?? null,
      provider: overrides.provider ?? 'local',
      providerId: overrides.providerId ?? null,
    },
  });
}

// ============ PROJECT FACTORY ============

interface CreateTestProjectOverrides {
  name?: string;
  description?: string | null;
  color?: string;
  icon?: string | null;
  ownerId?: string;
  createDefaultColumns?: boolean;
}

/**
 * Creates a project with the given owner. If no ownerId, creates a test user first.
 * By default creates 3 columns (To Do, In Progress, Done) and an OWNER membership.
 */
export async function createTestProject(
  overrides: CreateTestProjectOverrides = {}
): Promise<Project & { owner: User; columns: Column[] }> {
  let ownerId = overrides.ownerId;
  let owner: User | undefined;

  if (!ownerId) {
    owner = await createTestUser();
    ownerId = owner.id;
  }

  const project = await prisma.project.create({
    data: {
      name: overrides.name ?? faker.company.name(),
      description: overrides.description ?? faker.lorem.sentence(),
      color: overrides.color ?? faker.color.rgb(),
      icon: overrides.icon ?? null,
      ownerId,
      members: {
        create: {
          userId: ownerId,
          role: 'OWNER',
        },
      },
      ...(overrides.createDefaultColumns !== false
        ? {
            columns: {
              create: [
                { name: 'To Do', order: 0 },
                { name: 'In Progress', order: 1 },
                { name: 'Done', order: 2 },
              ],
            },
          }
        : {}),
    },
    include: {
      owner: true,
      columns: { orderBy: { order: 'asc' } },
    },
  });

  return project;
}

// ============ COLUMN FACTORY ============

interface CreateTestColumnOverrides {
  name?: string;
  order?: number;
  color?: string | null;
  projectId: string;
}

export async function createTestColumn(
  overrides: CreateTestColumnOverrides
): Promise<Column> {
  return prisma.column.create({
    data: {
      name: overrides.name ?? faker.word.noun(),
      order: overrides.order ?? 0,
      color: overrides.color ?? null,
      projectId: overrides.projectId,
    },
  });
}

// ============ TASK FACTORY ============

interface CreateTestTaskOverrides {
  title?: string;
  description?: string | null;
  order?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  dueDate?: Date | null;
  columnId: string;
  createdById: string;
}

export async function createTestTask(
  overrides: CreateTestTaskOverrides
): Promise<Task> {
  return prisma.task.create({
    data: {
      title: overrides.title ?? faker.lorem.sentence({ min: 3, max: 8 }),
      description: overrides.description ?? faker.lorem.paragraph(),
      order: overrides.order ?? 0,
      priority: overrides.priority ?? null,
      dueDate: overrides.dueDate ?? null,
      columnId: overrides.columnId,
      createdById: overrides.createdById,
    },
  });
}

// ============ LABEL FACTORY ============

interface CreateTestLabelOverrides {
  name?: string;
  color?: string;
  projectId: string;
}

export async function createTestLabel(
  overrides: CreateTestLabelOverrides
): Promise<Label> {
  return prisma.label.create({
    data: {
      name: overrides.name ?? faker.word.adjective(),
      color: overrides.color ?? faker.color.rgb(),
      projectId: overrides.projectId,
    },
  });
}

// ============ COMMENT FACTORY ============

interface CreateTestCommentOverrides {
  content?: string;
  taskId: string;
  userId: string;
}

export async function createTestComment(
  overrides: CreateTestCommentOverrides
): Promise<Comment> {
  return prisma.comment.create({
    data: {
      content: overrides.content ?? faker.lorem.paragraph(),
      taskId: overrides.taskId,
      userId: overrides.userId,
    },
  });
}
