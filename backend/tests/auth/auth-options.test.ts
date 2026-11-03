import { describe, expect, it } from 'vitest';

import { authPolicy } from '../../src/modules/auth/auth-policy';
import { sharedAuthOptions } from '../../src/modules/auth/auth-options';
import { getAuthTrustedOrigins } from '../../src/modules/auth/trusted-origins';

describe('server authentication options', () => {
  it('applies the password limits used by the API', () => {
    expect(sharedAuthOptions.emailAndPassword.minPasswordLength).toBe(authPolicy.minimumPasswordLength);
    expect(sharedAuthOptions.emailAndPassword.maxPasswordLength).toBe(authPolicy.maximumPasswordLength);
  });

  it('trusts the local Expo web app while developing', () => {
    const origins = getAuthTrustedOrigins({
      NODE_ENV: 'development',
      BETTER_AUTH_URL: 'http://localhost:3000',
      AUTH_TRUSTED_ORIGINS: [],
    });

    expect(origins).toEqual(expect.arrayContaining(['http://localhost:*', 'http://127.0.0.1:*']));
  });

  it('does not trust local web origins in production', () => {
    const origins = getAuthTrustedOrigins({
      NODE_ENV: 'production',
      BETTER_AUTH_URL: 'https://api.example.com',
      AUTH_TRUSTED_ORIGINS: ['https://app.example.com'],
    });

    expect(origins).not.toContain('http://localhost:*');
    expect(origins).toContain('https://app.example.com');
    expect(origins).toContain('https://api.example.com');
  });

  it('enables verified account linking without forcing trusted providers', () => {
    expect(sharedAuthOptions.user.deleteUser.enabled).toBe(true);
    expect(sharedAuthOptions.session.freshAge).toBe(authPolicy.sensitiveActionFreshnessSeconds);
    expect(sharedAuthOptions.account.accountLinking.enabled).toBe(true);
    expect(sharedAuthOptions.account.accountLinking).not.toHaveProperty('trustedProviders');
  });
});
