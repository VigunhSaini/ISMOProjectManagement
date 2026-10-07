// backend/src/index.ts
// Server entry point — starts listening and handles graceful shutdown

import { createApp } from './app';
import { env } from './config/env';
import prisma from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n🚀 Server running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${env.PORT}/health\n`);
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✓ Database connection closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;

