// backend/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardStats } from '../services/dashboard.service';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const stats = await getDashboardStats(req.user!.userId);
    res.status(200).json({ success: true, data: { stats } });
  } catch (err) {
    next(err);
  }
});

export default router;

