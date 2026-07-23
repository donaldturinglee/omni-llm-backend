import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { settings } from '@/modules/settings/index.ts';

export const connectionUrl = (database: string = settings.postgres_database): string => {
    const user = encodeURIComponent(settings.postgres_user);
    const password = encodeURIComponent(settings.postgres_password);

    return `postgres://${user}:${password}@${settings.postgres_host}:${settings.postgres_port}/${database}`;
};

export const url = connectionUrl();

export const pool = new Pool({
    connectionString: url,
});

export const postgres = drizzle(pool);

export type Postgres = typeof postgres;
