import { SignJWT, jwtVerify, errors } from 'jose';
import { uuid4 } from '@/modules/uuid/index.ts';
import { settings } from '@/modules/settings/index.ts';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload extends Record<string, unknown> {
    iss?: string;
    aud?: string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    sub?: string;
    type?: TokenType;
}

export const API_KEY_PREFIXES = ['sk-'] as const;
export const JWT_PATTERN = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

const secretKey = (secret: string | undefined, name: string): Uint8Array => {
    if (!secret) {
        throw new Error(`${name} is not configured.`);
    }
    return new TextEncoder().encode(secret);
};

const sign = async (
    secret: string | undefined,
    name: string,
    type: TokenType,
    data: Record<string, unknown>,
    expiresIn: string | number,
): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);

    let token = new SignJWT({ ...data, type })
        .setProtectedHeader({ alg: settings.jwt_algorithm })
        .setJti(uuid4())
        .setIssuedAt(now)
        .setNotBefore(now)
        .setExpirationTime(expiresIn);

    if (settings.jwt_issuer) {
        token = token.setIssuer(settings.jwt_issuer);
    }
    if (settings.jwt_audience) {
        token = token.setAudience(settings.jwt_audience);
    }

    return token.sign(secretKey(secret, name));
};

export const generateAccessToken = async (
    data: Record<string, unknown>,
    expiresIn: string | number = `${settings.jwt_access_token_expires_minutes}m`,
): Promise<string> => {
    return sign(settings.jwt_secret_key, 'jwt_secret_key', 'access', data, expiresIn);
};

export const generateRefreshToken = async (
    data: Record<string, unknown>,
    expiresIn: string | number = `${settings.jwt_refresh_token_expires_days}d`,
): Promise<string> => {
    return sign(settings.jwt_refresh_secret_key, 'jwt_refresh_secret_key', 'refresh', data, expiresIn);
};

export const decodeJwt = async (
    secret: string | undefined,
    token: string,
): Promise<TokenPayload | null> => {
    if (!secret) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, secretKey(secret, 'secret'), {
            algorithms: [settings.jwt_algorithm],
            ...(settings.jwt_audience ? { audience: settings.jwt_audience } : {}),
            ...(settings.jwt_issuer ? { issuer: settings.jwt_issuer } : {}),
        });

        return payload as TokenPayload;
    } catch (error) {
        if (error instanceof errors.JOSEError) {
            return null;
        }
        throw error;
    }
};

export const verifyAccessToken = async (token: string): Promise<TokenPayload | null> => {
    const payload = await decodeJwt(settings.jwt_secret_key, token);

    if (!payload) {
        return null;
    }

    if (payload.type !== 'access') {
        return null;
    }

    if (!payload.jti || !payload.exp) {
        return null;
    }

    return payload;
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
    const payload = await decodeJwt(settings.jwt_refresh_secret_key, token);

    if (!payload) {
        return null;
    }

    if (payload.type !== 'refresh') {
        return null;
    }

    if (!payload.jti) {
        return null;
    }

    return payload;
};
