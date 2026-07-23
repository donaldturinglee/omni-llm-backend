import express from 'express';
import helmet from 'helmet';
import { router as v1Router } from '@/features/v1/index.ts';
import { settings } from '@/modules/settings/index.ts';
import { corsMiddleware, exceptionMiddleware, loggingMiddleware, notFoundMiddleware } from '@/modules/middleware/index.ts';
import { logger } from '@/modules/logging/index.ts';

const main = express();

main.disable('x-powered-by');

main.use(helmet());
main.use(corsMiddleware);
main.use(loggingMiddleware);
main.use(express.json());

main.use(v1Router);

main.use(notFoundMiddleware);
main.use(exceptionMiddleware);

main.listen(settings.port, () => {
  logger.info(`Server running on port ${settings.port}`);
  logger.info(`Environment: ${settings.profile}`);
});

export default main;
