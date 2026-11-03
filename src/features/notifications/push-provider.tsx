import * as Application from 'expo-application';
import Constants from 'expo-constants';
import type { DevicePushToken } from 'expo-notifications';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { apiRequest } from '@/lib/api/api-client';

import { canReceiveNotifications, readNotificationPermission } from './permissions';

type PushState = { token: string | null; busy: boolean; error: string | null; synced: boolean };

const PushContext = createContext<
  (PushState & {
    registerForPushNotifications: () => Promise<void>;
    unregisterFromBackend: () => Promise<void>;
  }) | null
>(null);

export function PushRegistrationProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PushState>({ token: null, busy: false, error: null, synced: false });
  const latestRequestId = useRef(0);
  const isRegistrationInProgress = useRef(false);
  const hasRegistered = useRef(false);

  const syncTokenToBackend = useCallback(async (token: string) => {
    await apiRequest('/api/push/register', {
      method: 'POST',
      body: { token, platform: Platform.OS },
    });
  }, []);

  const registerForPushNotifications = useCallback(
    async (nativeToken?: DevicePushToken) => {
      if (isRegistrationInProgress.current && !nativeToken) return;
      const requestId = ++latestRequestId.current;
      isRegistrationInProgress.current = true;
      setState((previous) => ({ ...previous, busy: true, error: null }));
      try {
        const token = await requestExpoPushToken(nativeToken);
        if (requestId !== latestRequestId.current) return;
        await syncTokenToBackend(token);
        if (requestId !== latestRequestId.current) return;
        hasRegistered.current = true;
        setState({ token, busy: false, error: null, synced: true });
      } catch (error) {
        if (requestId !== latestRequestId.current) return;
        const detail = error instanceof Error ? error.message : 'Registration failed.';
        setState({ token: null, busy: false, error: detail, synced: false });
      } finally {
        if (requestId === latestRequestId.current) isRegistrationInProgress.current = false;
      }
    },
    [syncTokenToBackend],
  );

  const unregisterFromBackend = useCallback(async () => {
    const token = state.token;
    if (!token) return;
    try {
      await apiRequest('/api/push/unregister', {
        method: 'DELETE',
        body: { token },
      });
    } catch {
      // Sign-out should continue even if token cleanup fails.
    } finally {
      hasRegistered.current = false;
      setState({ token: null, busy: false, error: null, synced: false });
    }
  }, [state.token]);

  useEffect(() => {
    let disposed = false;
    let removeListener: (() => void) | undefined;
    if (Platform.OS !== 'web') {
      void import('expo-notifications')
        .then((Notifications) => {
          if (disposed) return;
          const listener = Notifications.addPushTokenListener((nativeToken) => {
            if (hasRegistered.current) void registerForPushNotifications(nativeToken);
          });
          removeListener = () => listener.remove();
        })
        .catch(() => {
          if (!disposed) {
            setState({
              token: null,
              busy: false,
              error: 'Token updates are unavailable. Reload the development build.',
              synced: false,
            });
          }
        });
    }
    return () => {
      disposed = true;
      removeListener?.();
      latestRequestId.current++;
      isRegistrationInProgress.current = false;
    };
  }, [registerForPushNotifications]);

  return (
    <PushContext.Provider value={{ ...state, registerForPushNotifications, unregisterFromBackend }}>
      {children}
    </PushContext.Provider>
  );
}

export function usePushRegistration() {
  const context = useContext(PushContext);
  if (!context) throw new Error('usePushRegistration must be used inside PushRegistrationProvider.');
  return context;
}

async function requestExpoPushToken(devicePushToken?: DevicePushToken): Promise<string> {
  const registration = (async () => {
    if (Platform.OS === 'web') throw new Error('Open the iOS or Android development build to register.');
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (typeof projectId !== 'string' || !projectId.trim()) {
      throw new Error('Link this app to an EAS project before registering for push notifications.');
    }

    const Notifications = await import('expo-notifications');
    const permission = await readNotificationPermission();
    if (!canReceiveNotifications(permission)) {
      throw new Error('Enable notifications first, then try registering again.');
    }

    const isIosSimulator =
      Platform.OS === 'ios' &&
      (await Application.getIosApplicationReleaseTypeAsync()) === Application.ApplicationReleaseType.SIMULATOR;

    return (
      await Notifications.getExpoPushTokenAsync({
        projectId,
        devicePushToken,
        ...(isIosSimulator ? { development: true } : {}),
      })
    ).data;
  })();

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Registration timed out. Check your connection and try again.'));
    }, 20_000);
  });

  try {
    return await Promise.race([registration, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
