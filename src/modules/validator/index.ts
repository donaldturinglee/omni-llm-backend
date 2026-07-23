import type { RequestHandler } from 'express';
import type { ZodError, ZodType } from 'zod';
import { BadRequestException } from '@/modules/exceptions/index.ts';

const formatIssues = (error: ZodError): string => {
    return error.issues
        .map((issue) => (issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message))
        .join('; ');
};

export const validateBody = (schema: ZodType): RequestHandler => (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        next(new BadRequestException({ message: `Validation failed: ${formatIssues(result.error)}` }));
        return;
    }

    req.body = result.data;
    next();
};

export const validateParams = (schema: ZodType): RequestHandler => (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
        next(new BadRequestException({ message: `Invalid parameters: ${formatIssues(result.error)}` }));
        return;
    }

    next();
};

export const validateQuery = (schema: ZodType): RequestHandler => (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        next(new BadRequestException({ message: `Invalid query parameters: ${formatIssues(result.error)}` }));
        return;
    }

    next();
};
