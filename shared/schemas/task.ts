import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../types';

// ============================================================
// shared/schemas/task.ts — Zod validation for task endpoints
// ============================================================

const taskPriorityEnum = z.nativeEnum(TaskPriority);
const taskStatusEnum = z.nativeEnum(TaskStatus);

export const createTaskSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name cannot be empty')
    .max(200, 'Task name must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateTaskSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name cannot be empty')
    .max(200, 'Task name must be at most 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional()
    .nullable(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export const taskIdParamSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export const taskQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'dueDate', 'priority', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
