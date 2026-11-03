import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth/minimal';
import { emailOTP } from 'better-auth/plugins';

import { appConfig } from '../../config/app-config';
import { getServerEnv } from '../../config/env';
import * as authSchema from '../../db/auth-schema';
import { getDatabase } from '../../db';
import { sendAuthOtpEmail } from '../email/email-delivery';
import { sharedAuthOptions } from './auth-options';
import { getAuthTrustedOrigins } from './trusted-origins';

function createAuth() {
  const env = getServerEnv();
  const googleConfigured = Boolean(
    env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID &&
      env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID &&
      env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET,
  );

  return betterAuth({
    ...sharedAuthOptions,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDatabase(), {
      provider: 'pg',
      schema: authSchema,
    }),
    emailAndPassword: {
      ...sharedAuthOptions.emailAndPassword,
      revokeSessionsOnPasswordReset: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
    },
    socialProviders: {
      apple: {
        clientId: appConfig.iosBundleIdentifier,
        appBundleIdentifier: appConfig.iosBundleIdentifier,
        mapProfileToUser: (profile) => ({
          email: profile.email ?? `${profile.sub}@apple.placeholder.local`,
        }),
      },
      ...(googleConfigured
        ? {
            google: {
              clientId: [
                env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
                env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
                env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
              ],
              clientSecret: env.GOOGLE_CLIENT_SECRET!,
            },
          }
        : {}),
    },
    trustedOrigins: getAuthTrustedOrigins(env),
    plugins: [
      expo(),
      emailOTP({
        overrideDefaultEmailVerification: true,
        otpLength: 6,
        expiresIn: 5 * 60,
        allowedAttempts: 3,
        storeOTP: 'hashed',
        rateLimit: { window: 60, max: 3 },
        sendVerificationOTP: async ({ email, otp, type }) => {
          try {
            await sendAuthOtpEmail({ recipient: email, code: otp, purpose: type });
          } catch (error) {
            // A mail outage must not roll back or reject account creation.
            if (type !== 'email-verification') throw error;
          }
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let auth: Auth | undefined;

export function getAuth() {
  auth ??= createAuth();
  return auth;
}
