// backend/src/controllers/task.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as TaskService from '../services/task.service';
import type { TaskQueryParams } from '../shared/schemas/task';

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await TaskService.getTasks(req.user!.userId, req.query as unknown as TaskQueryParams);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await TaskService.getTask(String(req.params.id), req.user!.userId);
    res.status(200).json({ success: true, data: { task } });
  } catch (err) { next(err); }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await TaskService.createTask(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: { task } });
  } catch (err) { next(err); }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await TaskService.updateTask(String(req.params.id), req.user!.userId, req.body);
    res.status(200).json({ success: true, data: { task } });
  } catch (err) { next(err); }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await TaskService.deleteTask(String(req.params.id), req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}
