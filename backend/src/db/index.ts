import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getServerEnv } from '../config/env';
import * as authSchema from './auth-schema';
import * as notificationSchema from './notification-schema';
import * as pushSchema from './push-schema';

function createDatabase() {
  const pool = new Pool({
    connectionString: getServerEnv().DATABASE_URL,
  });

  return drizzle(pool, {
    schema: { ...authSchema, ...pushSchema, ...notificationSchema },
  });
}

export type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

export function getDatabase() {
  database ??= createDatabase();
  return database;
}
