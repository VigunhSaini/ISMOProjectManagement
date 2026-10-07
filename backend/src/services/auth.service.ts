// backend/src/services/auth.service.ts
// All authentication business logic — registration, login, profile fetch

import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { ConflictError, NotFoundError, UnauthorizedError } from '../lib/errors';
import type { RegisterInput, LoginInput } from '../shared/schemas/auth';

// Strip passwordHash from user before sending to client
function serializeUser(user: { id: string; name: string; email: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ConflictError('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
  });

  const token = signToken({ userId: user.id, email: user.email });
  return { user: serializeUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    // Same message regardless of whether email or password is wrong — prevents enumeration
    throw new UnauthorizedError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const token = signToken({ userId: user.id, email: user.email });
  return { user: serializeUser(user), token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');
  return serializeUser(user);
}

