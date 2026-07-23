import { Router } from 'express';
import { HealthService } from '@/features/v1/health/service.ts';

const router: Router = Router();
const service = new HealthService();

router.get('', (req, res) => {
    service.checkHealth(res);
});

export { router };
