// backend/src/services/task.service.ts
// Task CRUD — ownership enforced through project ownership (Task → Project → User)

import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../lib/errors';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryParams } from '../shared/schemas/task';

function serializeTask(t: {
  id: string; name: string; description: string | null;
  priority: TaskPriority; status: TaskStatus; dueDate: Date | null;
  projectId: string; createdAt: Date; updatedAt: Date;
}) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate?.toISOString() ?? null,
    projectId: t.projectId,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

/** Verify the project exists and is owned by userId — throws if not */
async function assertProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Project');
  return project;
}

export async function getTasks(userId: string, query: TaskQueryParams) {
  const { projectId, search, status, priority, page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.TaskWhereInput = {
    project: { userId }, // ownership through project
    ...(projectId && { projectId }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
    prisma.task.count({ where }),
  ]);

  return {
    items: tasks.map(serializeTask),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTask(id: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id, project: { userId } },
  });
  if (!task) throw new NotFoundError('Task');
  return serializeTask(task);
}

export async function createTask(userId: string, input: CreateTaskInput) {
  await assertProjectOwnership(input.projectId, userId);

  const task = await prisma.task.create({
    data: {
      name: input.name,
      description: input.description,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      projectId: input.projectId,
    },
  });
  return serializeTask(task);
}

export async function updateTask(id: string, userId: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findFirst({
    where: { id, project: { userId } },
  });
  if (!existing) throw new NotFoundError('Task');

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
    },
  });
  return serializeTask(task);
}

export async function deleteTask(id: string, userId: string) {
  const existing = await prisma.task.findFirst({
    where: { id, project: { userId } },
  });
  if (!existing) throw new NotFoundError('Task');

  await prisma.task.delete({ where: { id } });
  return { message: 'Task deleted successfully.' };
}

