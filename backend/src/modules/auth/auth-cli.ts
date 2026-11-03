import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth/minimal';
import { drizzle } from 'drizzle-orm/neon-http';

import { sharedAuthOptions } from './auth-options';

const cliDatabase = drizzle.mock();

// CLI-only configuration. Runtime application code must never import this file.
export const auth = betterAuth({
  ...sharedAuthOptions,
  baseURL: 'http://localhost:3000',
  database: drizzleAdapter(cliDatabase, {
    provider: 'pg',
  }),
  plugins: [expo()],
});
