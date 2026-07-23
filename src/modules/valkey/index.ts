import { Redis as Valkey } from 'iovalkey';
import { logger } from '@/modules/logging/index.ts';
import { settings } from '@/modules/settings/index.ts';

export const valkey = new Valkey({
    host: settings.valkey_host,
    port: settings.valkey_port,
    password: settings.valkey_password,
    db: settings.valkey_database,
});

// iovalkey turns an unhandled 'error' event into an uncaught exception.
valkey.on('error', (error: Error) => {
    logger.error(`Valkey connection error: ${error.message}`);
});
