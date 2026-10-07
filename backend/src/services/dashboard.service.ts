// backend/src/services/dashboard.service.ts
// Aggregated dashboard statistics for the authenticated user

import prisma from '../lib/prisma';
import { TaskStatus, ProjectStatus } from '@prisma/client';

export async function getDashboardStats(userId: string) {
  const [totalProjects, completedProjects, projectsInProgress, tasks] =
    await prisma.$transaction([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.COMPLETED } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.IN_PROGRESS } }),
      // Fetch all tasks for this user and aggregate in JS — avoids Prisma groupBy typing quirks
      prisma.task.findMany({
        where: { project: { userId } },
        select: { status: true },
      }),
    ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;

  return {
    totalProjects,
    completedProjects,
    projectsInProgress,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
  };
}
