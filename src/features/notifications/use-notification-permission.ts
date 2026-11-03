import type { NotificationPermissionsStatus } from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { canReceiveNotifications, readNotificationPermission, requestNotificationPermission } from './permissions';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionsStatus | null>(null);
  const [loading, setLoading] = useState(Platform.OS !== 'web');
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const inFlight = useRef(false);
  const supported = Platform.OS !== 'web';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const update = useCallback(
    async (request = false) => {
      if (!supported || inFlight.current) return;
      inFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        const result = await (request ? requestNotificationPermission() : readNotificationPermission());
        if (mounted.current) setPermission(result);
      } catch {
        if (mounted.current) setError('Could not check notification permission. Please try again.');
      } finally {
        inFlight.current = false;
        if (mounted.current) setLoading(false);
      }
    },
    [supported],
  );

  useFocusEffect(
    useCallback(() => {
      void update();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') void update();
      });
      return () => subscription.remove();
    }, [update]),
  );

  const openSettings = !!permission && (canReceiveNotifications(permission) || !permission.canAskAgain);

  async function act() {
    if (loading || !supported) return;
    if (error) return update();
    if (!openSettings) return update(true);
    try {
      await Linking.openSettings();
    } catch {
      setError('Could not open Settings. Open your device settings manually.');
    }
  }

  return { permission, loading, error, supported, openSettings, act };
}
