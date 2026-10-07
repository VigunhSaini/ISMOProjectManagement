// backend/src/routes/project.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  projectQuerySchema,
} from '../shared/schemas/project';
import * as ProjectController from '../controllers/project.controller';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', validate({ query: projectQuerySchema }), ProjectController.getProjects);
router.get('/:id', validate({ params: projectIdParamSchema }), ProjectController.getProject);
router.post('/', validate({ body: createProjectSchema }), ProjectController.createProject);
router.put('/:id', validate({ params: projectIdParamSchema, body: updateProjectSchema }), ProjectController.updateProject);
router.delete('/:id', validate({ params: projectIdParamSchema }), ProjectController.deleteProject);

export default router;

