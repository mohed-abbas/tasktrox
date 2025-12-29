import type { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from '../validators/project.validator.js';

export class ProjectController {
  // ============ PROJECT CRUD ============

  /**
   * GET /projects
   * List all projects for the authenticated user
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projects = await ProjectService.getUserProjects(userId);

      res.json({
        success: true,
        data: { projects },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/:projectId
   * Get a single project by ID
   */
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;

      const project = await ProjectService.getProjectById(projectId, userId);

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects
   * Create a new project
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body as CreateProjectInput;

      const project = await ProjectService.createProject(userId, data);

      res.status(201).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /projects/:projectId
   * Update a project
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const data = req.body as UpdateProjectInput;

      const project = await ProjectService.updateProject(projectId, userId, data);

      if (!project) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this project',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/:projectId
   * Soft delete a project (owner only)
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;

      const success = await ProjectService.deleteProject(projectId, userId);

      if (!success) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only the project owner can delete the project',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { message: 'Project deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ MEMBER MANAGEMENT ============

  /**
   * GET /projects/:projectId/members
   * Get project members
   */
  static async listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;

      const members = await ProjectService.getProjectMembers(projectId, userId);

      if (members === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { members },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:projectId/members
   * Add a member to the project
   */
  static async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const data = req.body as AddMemberInput;

      const member = await ProjectService.addMember(projectId, userId, data);

      if (!member) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to add members to this project',
          },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: { member },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }
        if (error.message.includes('already a member')) {
          res.status(409).json({
            success: false,
            error: {
              code: 'ALREADY_MEMBER',
              message: error.message,
            },
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * PATCH /projects/:projectId/members/:userId
   * Update a member's role
   */
  static async updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = req.user!.id;
      const projectId = req.params.projectId as string;
      const targetUserId = req.params.userId as string;
      const { role } = req.body as UpdateMemberRoleInput;

      const member = await ProjectService.updateMemberRole(projectId, requesterId, targetUserId, role);

      if (!member) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only the project owner can change member roles',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { member },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('owner')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_OPERATION',
              message: error.message,
            },
          });
          return;
        }
        if (error.message.includes('OWNER role')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_ROLE',
              message: error.message,
            },
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * DELETE /projects/:projectId/members/:userId
   * Remove a member from the project
   */
  static async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = req.user!.id;
      const projectId = req.params.projectId as string;
      const targetUserId = req.params.userId as string;

      const success = await ProjectService.removeMember(projectId, requesterId, targetUserId);

      if (!success) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot remove this member. Either you lack permission or the member is the project owner.',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { message: 'Member removed successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectController;
