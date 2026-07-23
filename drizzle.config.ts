import { defineConfig } from 'drizzle-kit';
import { url } from './src/modules/postgres/index.ts';

export default defineConfig({
    dialect: 'postgresql',
    out: './src/modules/postgres/migrations',
    schema: './src/features/**/domain.ts',
    dbCredentials: {
        url,
    },
});
