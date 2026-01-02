import { prisma } from '../config/database.js';
import type { Project, ProjectMember, Role, Column } from '@prisma/client';
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput } from '../validators/project.validator.js';
import { projectCache } from './cache.service.js';

// Default columns for new projects
const DEFAULT_COLUMNS = [
  { name: 'To Do', order: 0 },
  { name: 'In Progress', order: 1 },
  { name: 'Review', order: 2 },
  { name: 'Done', order: 3 },
];

type MemberWithUser = ProjectMember & {
  user: { id: string; name: string; email: string; avatar: string | null };
};

type ProjectWithRelations = Project & {
  columns?: Column[];
  members?: MemberWithUser[];
  _count?: { members: number };
};

export class ProjectService {
  // ============ PROJECT CRUD ============

  /**
   * Get all projects for a user (owned + member)
   * Results are cached for 60 seconds
   */
  static async getUserProjects(userId: string): Promise<ProjectWithRelations[]> {
    return projectCache.getUserProjects(userId, () =>
      prisma.project.findMany({
        where: {
          deletedAt: null,
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
          members: {
            take: 5,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
    );
  }

  /**
   * Get a single project by ID
   * Results are cached for 2 minutes
   */
  static async getProjectById(
    projectId: string,
    userId: string
  ): Promise<ProjectWithRelations | null> {
    // First check access (cached)
    const hasAccess = await this.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Then get project data (cached)
    return projectCache.getProject(projectId, () =>
      prisma.project.findFirst({
        where: {
          id: projectId,
          deletedAt: null,
        },
        include: {
          columns: {
            orderBy: { order: 'asc' },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      })
    );
  }

  /**
   * Create a new project with default columns
   */
  static async createProject(
    userId: string,
    data: CreateProjectInput
  ): Promise<ProjectWithRelations> {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#6366f1',
        icon: data.icon,
        ownerId: userId,
        // Create default columns
        columns: {
          create: DEFAULT_COLUMNS,
        },
        // Add owner as OWNER member
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Invalidate user's project list cache
    await projectCache.invalidateUserProjects(userId);

    return project;
  }

  /**
   * Update a project
   */
  static async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectInput
  ): Promise<ProjectWithRelations | null> {
    // Check access (must be owner or admin)
    const hasAccess = await this.checkProjectAccess(projectId, userId, ['OWNER', 'ADMIN']);
    if (!hasAccess) {
      return null;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Invalidate project cache and user project lists for all members
    await projectCache.invalidateProject(projectId);

    return project;
  }

  /**
   * Soft delete a project (owner only)
   */
  static async deleteProject(projectId: string, userId: string): Promise<boolean> {
    // Only owner can delete
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
        deletedAt: null,
      },
      include: {
        members: { select: { userId: true } },
      },
    });

    if (!project) {
      return false;
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    // Invalidate all related caches
    await projectCache.invalidateProject(projectId);
    // Invalidate project lists for all members
    for (const member of project.members) {
      await projectCache.invalidateUserProjects(member.userId);
    }

    return true;
  }

  // ============ MEMBER MANAGEMENT ============

  /**
   * Get project members
   * Results are cached for 5 minutes
   */
  static async getProjectMembers(
    projectId: string,
    userId: string
  ): Promise<(ProjectMember & { user: { id: string; name: string; email: string; avatar: string | null } })[] | null> {
    // Check if user has access
    const hasAccess = await this.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return projectCache.getMembers(projectId, () =>
      prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      })
    );
  }

  /**
   * Add a member to project by email
   */
  static async addMember(
    projectId: string,
    requesterId: string,
    data: AddMemberInput
  ): Promise<ProjectMember | null> {
    // Check if requester has permission (owner or admin)
    const hasAccess = await this.checkProjectAccess(projectId, requesterId, ['OWNER', 'ADMIN']);
    if (!hasAccess) {
      return null;
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!userToAdd) {
      throw new Error('User not found with this email');
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMember) {
      throw new Error('User is already a member of this project');
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: data.role as Role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Invalidate membership caches
    await projectCache.invalidateMembership(projectId, userToAdd.id);

    return member;
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    projectId: string,
    requesterId: string,
    targetUserId: string,
    newRole: Role
  ): Promise<ProjectMember | null> {
    // Only owner can change roles
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: requesterId,
        deletedAt: null,
      },
    });

    if (!project) {
      return null;
    }

    // Cannot change owner role
    if (targetUserId === project.ownerId) {
      throw new Error('Cannot change the role of the project owner');
    }

    // Cannot assign OWNER role
    if (newRole === 'OWNER') {
      throw new Error('Cannot assign OWNER role');
    }

    const updatedMember = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Invalidate membership caches
    await projectCache.invalidateMembership(projectId, targetUserId);

    return updatedMember;
  }

  /**
   * Remove a member from project
   */
  static async removeMember(
    projectId: string,
    requesterId: string,
    targetUserId: string
  ): Promise<boolean> {
    // Check if requester has permission (owner or admin, or self-removal)
    const isSelfRemoval = requesterId === targetUserId;

    if (!isSelfRemoval) {
      const hasAccess = await this.checkProjectAccess(projectId, requesterId, ['OWNER', 'ADMIN']);
      if (!hasAccess) {
        return false;
      }
    }

    // Cannot remove the owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project || targetUserId === project.ownerId) {
      return false;
    }

    // Remove member
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
    });

    // Invalidate membership caches
    await projectCache.invalidateMembership(projectId, targetUserId);

    return true;
  }

  // ============ HELPERS ============

  /**
   * Check if user has access to project with optional role requirement
   * Basic access check is cached for 5 minutes
   */
  static async checkProjectAccess(
    projectId: string,
    userId: string,
    requiredRoles?: Role[]
  ): Promise<boolean> {
    // For role-specific checks, we can't use the simple boolean cache
    // We need the actual role to check against requiredRoles
    if (requiredRoles) {
      const role = await this.getUserRole(projectId, userId);
      if (!role) return false;
      return requiredRoles.includes(role);
    }

    // For simple access checks, use cached result
    return projectCache.checkAccess(projectId, userId, async () => {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        include: {
          project: {
            select: {
              deletedAt: true,
            },
          },
        },
      });

      return !!(member && !member.project.deletedAt);
    });
  }

  /**
   * Get user's role in a project
   */
  static async getUserRole(projectId: string, userId: string): Promise<Role | null> {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return member?.role || null;
  }
}

export default ProjectService;
