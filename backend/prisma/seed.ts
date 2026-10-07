// backend/prisma/seed.ts
// Run: npm run db:seed
// Creates demo user + sample projects + sample tasks for development

import { PrismaClient, ProjectStatus, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo user
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash,
    },
  });

  console.log(`✓ Demo user: ${user.email} (password: Password123!)`);

  // Delete existing seeded projects to keep seed idempotent
  await prisma.project.deleteMany({ where: { userId: user.id } });

  // Create sample projects
  const proj1 = await prisma.project.create({
    data: {
      name: 'E-commerce Redesign',
      description: 'Complete overhaul of the storefront UI and checkout flow.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      userId: user.id,
    },
  });

  const proj2 = await prisma.project.create({
    data: {
      name: 'Mobile App v2',
      description: 'Launch the v2 release with offline support and push notifications.',
      status: ProjectStatus.NOT_STARTED,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      userId: user.id,
    },
  });

  const proj3 = await prisma.project.create({
    data: {
      name: 'API Migration',
      description: 'Migrate legacy REST endpoints to GraphQL.',
      status: ProjectStatus.COMPLETED,
      startDate: new Date('2023-08-01'),
      endDate: new Date('2023-12-15'),
      userId: user.id,
    },
  });

  console.log(`✓ Created 3 sample projects`);

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      // E-commerce Redesign tasks
      {
        name: 'Design new landing page',
        description: 'Create Figma mockups for homepage redesign.',
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        dueDate: new Date('2024-02-28'),
        projectId: proj1.id,
      },
      {
        name: 'Implement product listing page',
        description: 'Responsive grid layout with filters and pagination.',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2024-04-15'),
        projectId: proj1.id,
      },
      {
        name: 'Redesign checkout flow',
        description: 'Streamline 4-step checkout to 2 steps.',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-05-30'),
        projectId: proj1.id,
      },
      // Mobile App v2 tasks
      {
        name: 'Set up offline sync architecture',
        description: 'Research and implement local SQLite cache with background sync.',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-08-31'),
        projectId: proj2.id,
      },
      {
        name: 'Push notification integration',
        description: 'Integrate Expo push notifications for task reminders.',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-10-31'),
        projectId: proj2.id,
      },
      {
        name: 'Beta testing plan',
        description: 'Define test groups, scenarios, and feedback channels.',
        priority: TaskPriority.LOW,
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-11-15'),
        projectId: proj2.id,
      },
      // API Migration tasks
      {
        name: 'Design GraphQL schema',
        description: 'Map all REST endpoints to equivalent GraphQL queries and mutations.',
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        dueDate: new Date('2023-09-30'),
        projectId: proj3.id,
      },
      {
        name: 'Migrate authentication endpoints',
        description: 'Port /login, /register, /refresh-token to GraphQL mutations.',
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        dueDate: new Date('2023-11-30'),
        projectId: proj3.id,
      },
    ],
  });

  console.log(`✓ Created 8 sample tasks`);
  console.log('\n✅ Seed complete!\n');
  console.log('  Demo credentials:');
  console.log('  Email:    demo@example.com');
  console.log('  Password: Password123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

