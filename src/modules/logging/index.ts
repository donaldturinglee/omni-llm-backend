import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { settings } from '@/modules/settings/index.ts';

const { combine, timestamp, json, errors } = format;

const LOG_DIR = (settings.profile === 'development' || settings.profile === 'test')
    ? './logs'
    : '/var/log/omni-ai-backend';

const logger = createLogger({
    level: settings.log_level,
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json(),
    ),
    transports: [
        new DailyRotateFile({
            filename: `${LOG_DIR}/access-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            maxSize: '50m',
            zippedArchive: true,
        }),
        new DailyRotateFile({
            filename: `${LOG_DIR}/error-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '30d',
            maxSize: '50m',
            zippedArchive: true,
        }),
    ],
    defaultMeta: {
        service: 'omni-ai-backend',
    },
});

if (settings.profile === 'development') {
    logger.add(new transports.Console({ format: combine(timestamp(), json()) }));
}

export default logger;
export { logger };
