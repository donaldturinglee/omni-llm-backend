import { Pool } from 'pg';
import { connectionUrl } from '@/modules/postgres/index.ts';
import { settings } from '@/modules/settings/index.ts';

const pool = new Pool({
    connectionString: connectionUrl('postgres'),
});

const reset = async (): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query(`DROP DATABASE IF EXISTS "${settings.postgres_database}" WITH (FORCE)`);
        await client.query(`CREATE DATABASE "${settings.postgres_database}"`);

        console.log(`Database "${settings.postgres_database}" reset successfully.`);
    } finally {
        client.release();
        await pool.end();
    }
};

reset().catch((error: unknown) => {
    console.error('Failed to reset database:', error);
    process.exit(1);
});
