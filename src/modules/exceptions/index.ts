export interface APIExceptionOptions {
    statusCode?: number;
    code?: number;
    message?: string;
    headers?: Record<string, string>;
}

export class APIException extends Error {
    readonly statusCode: number;
    readonly code: number;
    readonly headers: Record<string, string> | undefined;

    constructor(options: APIExceptionOptions = {}) {
        const {
            statusCode = 500,
            code = 0,
            message = 'Internal Server Error',
            headers,
        } = options;

        super(message);

        this.name = new.target.name;
        this.statusCode = statusCode;
        this.code = code;
        this.headers = headers;
    }
}

export class BadRequestException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 400, message: 'Bad Request', ...options });
    }
}

export class UnauthorizedException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 401, message: 'Unauthorized', ...options });
    }
}

export class ForbiddenException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 403, message: 'Forbidden', ...options });
    }
}

export class NotFoundException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 404, message: 'Not Found', ...options });
    }
}

export class MethodNotAllowedException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 405, message: 'Method Not Allowed', ...options });
    }
}

export class ConflictException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 409, message: 'Conflict', ...options });
    }
}

export class UnprocessableContentException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 422, message: 'Unprocessable Content', ...options });
    }
}

export class TooManyRequestsException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 429, message: 'Too Many Requests', ...options });
    }
}

export class InternalServerErrorException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 500, message: 'Internal Server Error', ...options });
    }
}

export class NotImplementedException extends APIException {
    constructor(options: APIExceptionOptions = {}) {
        super({ statusCode: 501, message: 'Not Implemented', ...options });
    }
}
