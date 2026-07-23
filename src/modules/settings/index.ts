import dotenv from 'dotenv';
import { z } from 'zod';

const profile = process.env.PROFILE?.trim() || 'development';

dotenv.config({ path: `.env.${profile}`, quiet: true });

const environment = Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key.toLowerCase(), value]),
);

const list = z.preprocess(
    (value) => (typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value),
    z.array(z.string()),
);

const Setting = z.object({
    // Application
    profile: z.enum(['development', 'production', 'test']).default('development'),
    port: z.coerce.number().default(8000),
    version: z.string().default('0.0.1'),
    machine_id: z.coerce.number().min(0).max(31).default(0),
    data_center_id: z.coerce.number().min(0).max(31).default(0),
    log_level: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),

    // CORS
    cors_origins: list.default([]),
    cors_methods: list.default(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    cors_headers: list.default(['Content-Type', 'Authorization']),
    cors_credentials: z.stringbool().default(false),

    // Auth
    jwt_secret_key: z.string().optional(),
    jwt_refresh_secret_key: z.string().optional(),
    jwt_algorithm: z.string().default('HS256'),
    jwt_issuer: z.string().optional(),
    jwt_audience: z.string().optional(),
    jwt_access_token_expires_minutes: z.coerce.number().default(15),
    jwt_refresh_token_expires_days: z.coerce.number().default(7),

    // PostgreSQL
    postgres_host: z.string().default('127.0.0.1'),
    postgres_port: z.coerce.number().default(5432),
    postgres_user: z.string().default('postgres'),
    postgres_password: z.string().default('postgres'),
    postgres_database: z.string().default('omni_llm'),

    // Valkey
    valkey_host: z.string().default('127.0.0.1'),
    valkey_port: z.coerce.number().default(6379),
    valkey_password: z.string().optional(),
    valkey_database: z.coerce.number().default(0),

    // MongoDB
    mongo_host: z.string().default('127.0.0.1'),
    mongo_port: z.coerce.number().default(27017),
    mongo_user: z.string().default('mongo'),
    mongo_password: z.string().default('mongo'),
    mongo_database: z.string().default('omni_llm'),
});

const parsed = Setting.safeDecode(environment);

if (!parsed.success) {
    console.error('Invalid environment variables:', z.prettifyError(parsed.error));
    process.exit(1);
}

export type Settings = z.infer<typeof Setting>;
export const settings: Settings = parsed.data;
