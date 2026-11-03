import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { env } from '@/config/env';
import { isLoopbackUrl, normalizeApiBaseUrl, resolveNativeApiBaseUrl } from '@/lib/api/api-origin';

export function getApiBaseUrl() {
  if (env.apiBaseUrl) {
    if (__DEV__ && Platform.OS !== 'web' && isLoopbackUrl(env.apiBaseUrl)) {
      return resolveNativeApiBaseUrl(env.apiBaseUrl, Constants.expoConfig?.hostUri ?? null, Platform.OS);
    }

    return normalizeApiBaseUrl(env.apiBaseUrl, env.appEnvironment);
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return normalizeApiBaseUrl(window.location.origin, env.appEnvironment);
  }

  if (__DEV__) {
    return resolveNativeApiBaseUrl(
      'http://localhost:3000',
      Platform.OS === 'web' ? null : (Constants.expoConfig?.hostUri ?? null),
      Platform.OS,
    );
  }

  throw new Error('EXPO_PUBLIC_API_URL is required when the development server origin cannot be resolved');
}
