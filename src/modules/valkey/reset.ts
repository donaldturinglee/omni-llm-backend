import { settings } from '@/modules/settings/index.ts';
import { valkey } from '@/modules/valkey/index.ts';

const reset = async (): Promise<void> => {
    try {
        await valkey.flushdb();

        console.log(`Valkey database ${settings.valkey_database} reset successfully.`);
    } finally {
        valkey.disconnect();
    }
};

reset().catch((error: unknown) => {
    console.error('Failed to reset Valkey:', error);
    process.exit(1);
});
