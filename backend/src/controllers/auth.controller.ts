// backend/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import type { RegisterInput, LoginInput } from '../shared/schemas/auth';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await AuthService.registerUser(req.body as RegisterInput);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await AuthService.loginUser(req.body as LoginInput);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT — client deletes the token. Server confirms.
  res.status(200).json({ success: true, data: { message: 'Logged out successfully.' } });
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await AuthService.getMe(req.user!.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

