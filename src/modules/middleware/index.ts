import cors from 'cors';
import type { ErrorRequestHandler, Request, RequestHandler } from 'express';
import { APIException, NotFoundException, UnprocessableContentException } from '@/modules/exceptions/index.ts';
import { logger } from '@/modules/logging/index.ts';
import { settings } from '@/modules/settings/index.ts';

const getClientIP = (req: Request): string => {
    const header = (name: string): string | undefined => {
        const value = req.headers[name];
        return Array.isArray(value) ? value[0]?.trim() : value?.trim();
    };

    const connectingIp = header('cf-connecting-ip');
    if (connectingIp) {
        return connectingIp;
    }

    const forwardedFor = header('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
    }

    const realIp = header('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return req.socket.remoteAddress ?? 'unknown';
};

export const corsMiddleware: RequestHandler = cors({
    origin: settings.cors_origins,
    methods: settings.cors_methods,
    allowedHeaders: settings.cors_headers,
    credentials: settings.cors_credentials,
});

export const loggingMiddleware: RequestHandler = (req, res, next) => {
    const start = process.hrtime.bigint();
    const method = req.method;
    const path = req.path;
    const query = req.originalUrl.split('?')[1] ?? '';
    const clientIp = getClientIP(req);

    res.locals.clientIp = clientIp;

    logger.info({
        event: 'request.started',
        method,
        path,
        query,
        client_ip: clientIp,
    });

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        const message = {
            event: 'request.completed',
            method,
            path,
            query,
            client_ip: clientIp,
            status_code: res.statusCode,
            duration_ms: durationMs,
        };

        if (res.statusCode >= 500) {
            logger.error(message);
        } else if (res.statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.info(message);
        }
    });

    next();
};

export const notFoundMiddleware: RequestHandler = (req, res, next) => {
    next(new NotFoundException());
};

const normalize = (err: unknown): APIException | null => {
    if (err instanceof APIException) {
        return err;
    }

    // Malformed request body surfaced by express.json().
    if (err instanceof SyntaxError && (err as { type?: string }).type === 'entity.parse.failed') {
        return new UnprocessableContentException({ message: 'Invalid JSON format.' });
    }

    return null;
};

export const exceptionMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
    const exception = normalize(err);

    if (exception) {
        logger.warn(`API exception: ${exception.message}`);

        if (exception.headers) {
            res.set(exception.headers);
        }

        res.status(exception.statusCode).json({
            code: exception.code,
            message: exception.message,
            data: null,
        });

        return;
    }

    logger.error(`Unhandled exception: ${err instanceof Error ? (err.stack ?? err.message) : err}`);

    res.status(500).json({
        code: 0,
        message: 'Internal Server Error',
        data: null,
    });
};
