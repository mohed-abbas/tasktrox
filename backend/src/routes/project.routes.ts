import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
} from '../validators/project.validator.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// ============ PROJECT ROUTES ============

// GET /projects - List all projects for user
router.get('/', ProjectController.list);

// POST /projects - Create new project
router.post('/', validate(createProjectSchema), ProjectController.create);

// GET /projects/:projectId - Get single project
router.get('/:projectId', validate(projectIdParamSchema), ProjectController.get);

// PATCH /projects/:projectId - Update project
router.patch('/:projectId', validate(updateProjectSchema), ProjectController.update);

// DELETE /projects/:projectId - Delete project
router.delete('/:projectId', validate(projectIdParamSchema), ProjectController.delete);

// ============ MEMBER ROUTES ============

// GET /projects/:projectId/members - List project members
router.get('/:projectId/members', validate(projectIdParamSchema), ProjectController.listMembers);

// POST /projects/:projectId/members - Add member
router.post('/:projectId/members', validate(addMemberSchema), ProjectController.addMember);

// PATCH /projects/:projectId/members/:userId - Update member role
router.patch(
  '/:projectId/members/:userId',
  validate(updateMemberRoleSchema),
  ProjectController.updateMemberRole
);

// DELETE /projects/:projectId/members/:userId - Remove member
router.delete(
  '/:projectId/members/:userId',
  validate(removeMemberSchema),
  ProjectController.removeMember
);

export default router;
