import { MongoClient } from 'mongodb';
import { settings } from '@/modules/settings/index.ts';

export const connectionUrl = (): string => {
    const user = encodeURIComponent(settings.mongo_user);
    const password = encodeURIComponent(settings.mongo_password);

    return `mongodb://${user}:${password}@${settings.mongo_host}:${settings.mongo_port}`;
};

export const url = connectionUrl();

export const client = new MongoClient(url);

export const mongo = client.db(settings.mongo_database);
