import { z } from 'zod';
import { ProjectStatus } from '../types';

// ============================================================
// shared/schemas/project.ts — Zod validation for project endpoints
// ============================================================

const projectStatusEnum = z.nativeEnum(ProjectStatus);

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .max(200, 'Project name must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),
  status: projectStatusEnum.optional(),
  startDate: z.string().datetime({ offset: true }).optional().nullable(),
  endDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectIdParamSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

export const projectQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: projectStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>;
