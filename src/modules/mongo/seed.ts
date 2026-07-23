import { fileURLToPath } from 'node:url';
import { client } from '@/modules/mongo/index.ts';

export const seed = async (): Promise<void> => {
    console.log('Starting database seed...');

    console.log('Database seeded successfully.');
};

if (fileURLToPath(import.meta.url) === process.argv[1]) {
    seed()
        .catch((error: unknown) => {
            console.error('Failed to seed database:', error);
            process.exitCode = 1;
        })
        .finally(() => client.close());
}
