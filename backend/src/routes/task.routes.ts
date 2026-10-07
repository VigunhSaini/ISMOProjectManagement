// backend/src/routes/task.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
} from '../shared/schemas/task';
import * as TaskController from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: taskQuerySchema }), TaskController.getTasks);
router.get('/:id', validate({ params: taskIdParamSchema }), TaskController.getTask);
router.post('/', validate({ body: createTaskSchema }), TaskController.createTask);
router.put('/:id', validate({ params: taskIdParamSchema, body: updateTaskSchema }), TaskController.updateTask);
router.delete('/:id', validate({ params: taskIdParamSchema }), TaskController.deleteTask);

export default router;

