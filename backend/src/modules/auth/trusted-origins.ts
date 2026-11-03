import { appConfig } from '../../config/app-config';
import type { ServerEnv } from '../../config/env';

type TrustedOriginEnv = Pick<ServerEnv, 'NODE_ENV' | 'BETTER_AUTH_URL' | 'AUTH_TRUSTED_ORIGINS'>;

export function getAuthTrustedOrigins(env: TrustedOriginEnv) {
  return Array.from(
    new Set([
      `${appConfig.scheme}://`,
      `${appConfig.scheme}://*`,
      'https://appleid.apple.com',
      new URL(env.BETTER_AUTH_URL).origin,
      ...env.AUTH_TRUSTED_ORIGINS,
      ...(env.NODE_ENV === 'development'
        ? ['exp://', 'exp://**', 'http://localhost:*', 'http://127.0.0.1:*', 'http://192.168.*:*']
        : []),
    ]),
  );
}
