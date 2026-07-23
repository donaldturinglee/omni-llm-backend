import { randomUUID } from 'node:crypto';
import { Epoch, Snowflake } from '@/modules/uuid/snowflake.ts';
import { settings } from '@/modules/settings/index.ts';

const generator = new Snowflake({
    dataCenterId: BigInt(settings.data_center_id),
    machineId: BigInt(settings.machine_id),
});

export const snowflakeId = (): string => generator.nextId().toString();

export const uuid4 = (): string => randomUUID();

export { Epoch, Snowflake };
