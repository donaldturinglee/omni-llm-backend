import type { Response } from 'express';

export class HealthService {
    checkHealth(res: Response): void {
        res.status(200).json({
            code: 0,
            message: 'up',
            data: null,
        });
    }
}
