import { client, mongo } from '@/modules/mongo/index.ts';
import { settings } from '@/modules/settings/index.ts';

const reset = async (): Promise<void> => {
    try {
        await mongo.dropDatabase();

        console.log(`MongoDB database "${settings.mongo_database}" reset successfully.`);
    } finally {
        await client.close();
    }
};

reset().catch((error: unknown) => {
    console.error('Failed to reset MongoDB:', error);
    process.exit(1);
});
