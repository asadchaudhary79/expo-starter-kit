import { Platform } from 'react-native';

import { env } from '@/config/env';
import { authClient } from '@/lib/auth/auth-client';

export type GoogleSignInOutcome = 'success' | 'cancelled';

export async function signInWithGoogle(): Promise<GoogleSignInOutcome> {
  if (Platform.OS === 'web') {
    throw new Error('Google Sign-In is available in the iOS and Android apps.');
  }

  if (!env.googleWebClientId || !env.googleIosClientId || !env.googleAndroidClientId) {
    throw new Error('Google Sign-In is not configured yet.');
  }

  let google: typeof import('react-native-nitro-google-signin');

  try {
    google = await import('react-native-nitro-google-signin');
  } catch {
    throw new Error('Google Sign-In is unavailable in this app build.');
  }

  google.GoogleOneTapSignIn.configure({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId,
  });

  try {
    await google.GoogleOneTapSignIn.checkPlayServices();
    const response = await google.GoogleOneTapSignIn.presentExplicitSignIn();

    if (google.isCancelledResponse(response)) return 'cancelled';

    if (!google.isSuccessResponse(response)) {
      throw new Error('Google Sign-In could not be completed.');
    }

    const result = await authClient.signIn.social({
      provider: 'google',
      idToken: { token: response.data.idToken },
      fetchOptions: { disableSignal: true },
    });

    if (result.error) {
      if (result.error.code === 'OAUTH_LINK_ERROR') {
        throw new Error(
          'This email already has an account. Sign in with email and verify it, then try Google again.',
        );
      }

      throw new Error('Google Sign-In could not be completed.');
    }

    return 'success';
  } catch (error) {
    if (google.isErrorWithCode(error)) {
      if (error.code === google.statusCodes.SIGN_IN_CANCELLED) return 'cancelled';

      if (error.code === google.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Update Google Play Services and try again.');
      }

      if (error.code === google.statusCodes.DEVELOPER_ERROR) {
        throw new Error('Google Sign-In is not configured correctly for this app.');
      }
    }

    throw error instanceof Error
      ? error
      : new Error('Google Sign-In could not be completed.');
  }
}
