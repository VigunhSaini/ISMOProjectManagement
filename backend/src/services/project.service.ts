// backend/src/services/project.service.ts
// All project business logic — CRUD with strict userId ownership scoping

import { Prisma, ProjectStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import type { CreateProjectInput, UpdateProjectInput, ProjectQueryParams } from '../shared/schemas/project';

function serializeProject(p: {
  id: string; name: string; description: string | null;
  status: ProjectStatus; startDate: Date | null; endDate: Date | null;
  userId: string; createdAt: Date; updatedAt: Date;
  tasks?: { id: string; status: string }[];
  _count?: { tasks: number };
}) {
  const taskCount = p._count?.tasks ?? p.tasks?.length ?? 0;
  const completedTaskCount = p.tasks?.filter((t) => t.status === 'COMPLETED').length ?? 0;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    userId: p.userId,
    taskCount,
    completedTaskCount,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getProjects(userId: string, query: ProjectQueryParams) {
  const { search, status, page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectWhereInput = {
    userId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { _count: { select: { tasks: true } }, tasks: { select: { id: true, status: true } } },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    items: projects.map(serializeProject),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProject(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      tasks: { orderBy: { createdAt: 'desc' } },
      _count: { select: { tasks: true } },
    },
  });
  if (!project) throw new NotFoundError('Project');

  return {
    ...serializeProject(project),
    tasks: project.tasks.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate?.toISOString() ?? null,
      projectId: t.projectId,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  };
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      userId,
    },
    include: { _count: { select: { tasks: true } }, tasks: { select: { id: true, status: true } } },
  });
  return serializeProject(project);
}

export async function updateProject(id: string, userId: string, input: UpdateProjectInput) {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError('Project');

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
      ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
    },
    include: { _count: { select: { tasks: true } }, tasks: { select: { id: true, status: true } } },
  });
  return serializeProject(project);
}

export async function deleteProject(id: string, userId: string) {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError('Project');

  await prisma.project.delete({ where: { id } });
  return { message: 'Project deleted successfully.' };
}

