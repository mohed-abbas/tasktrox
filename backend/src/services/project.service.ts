import { prisma } from '../config/database.js';
import type { Project, ProjectMember, Role, Column } from '@prisma/client';
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput } from '../validators/project.validator.js';

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
   */
  static async getUserProjects(userId: string): Promise<ProjectWithRelations[]> {
    return prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
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
    });
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(
    projectId: string,
    userId: string
  ): Promise<ProjectWithRelations | null> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
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
    });

    return project;
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
    });

    if (!project) {
      return false;
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  // ============ MEMBER MANAGEMENT ============

  /**
   * Get project members
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

    return prisma.projectMember.findMany({
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
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });
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
    return prisma.projectMember.create({
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

    return prisma.projectMember.update({
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

    return true;
  }

  // ============ HELPERS ============

  /**
   * Check if user has access to project with optional role requirement
   */
  static async checkProjectAccess(
    projectId: string,
    userId: string,
    requiredRoles?: Role[]
  ): Promise<boolean> {
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

    if (!member || member.project.deletedAt) {
      return false;
    }

    if (requiredRoles && !requiredRoles.includes(member.role)) {
      return false;
    }

    return true;
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
