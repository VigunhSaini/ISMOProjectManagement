// backend/src/controllers/project.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as ProjectService from '../services/project.service';
import type { ProjectQueryParams } from '../shared/schemas/project';

export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await ProjectService.getProjects(req.user!.userId, req.query as unknown as ProjectQueryParams);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await ProjectService.getProject(String(req.params.id), req.user!.userId);
    res.status(200).json({ success: true, data: { project } });
  } catch (err) { next(err); }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await ProjectService.createProject(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: { project } });
  } catch (err) { next(err); }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await ProjectService.updateProject(String(req.params.id), req.user!.userId, req.body);
    res.status(200).json({ success: true, data: { project } });
  } catch (err) { next(err); }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await ProjectService.deleteProject(String(req.params.id), req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}
