import { Router } from 'express';
import { router as healthRouter } from '@/features/v1/health/router.ts';

const router: Router = Router();

// main router
router.use('/health', healthRouter);

export { router };
