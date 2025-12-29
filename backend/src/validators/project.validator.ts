import { z } from 'zod';

// ============ PROJECT SCHEMAS ============

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(100, 'Project name must be less than 100 characters'),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
      .optional(),
    icon: z.string().max(50).optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(100, 'Project name must be less than 100 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .nullable()
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
      .optional(),
    icon: z.string().max(50).nullable().optional(),
  }),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
});

// ============ MEMBER SCHEMAS ============

export const addMemberSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional().default('MEMBER'),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
});

// ============ TYPE EXPORTS ============

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type AddMemberInput = z.infer<typeof addMemberSchema>['body'];
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>['body'];
