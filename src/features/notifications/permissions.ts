import type { NotificationPermissionsStatus } from 'expo-notifications';
import { IosAuthorizationStatus } from 'expo-notifications/build/NotificationPermissions.types';
import { Platform } from 'react-native';

import { ensureNotificationChannels } from './channels';

export function canReceiveNotifications(permission: NotificationPermissionsStatus | null) {
  return (
    !!permission &&
    (permission.granted ||
      permission.ios?.status === IosAuthorizationStatus.AUTHORIZED ||
      permission.ios?.status === IosAuthorizationStatus.PROVISIONAL ||
      permission.ios?.status === IosAuthorizationStatus.EPHEMERAL)
  );
}

export async function readNotificationPermission() {
  if (Platform.OS === 'web') return null;
  await ensureNotificationChannels();
  const Notifications = await import('expo-notifications');
  return Notifications.getPermissionsAsync();
}

export async function requestNotificationPermission() {
  const current = await readNotificationPermission();
  if (!current || canReceiveNotifications(current) || !current.canAskAgain) return current;

  const Notifications = await import('expo-notifications');
  return Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
}

export function permissionLabel(permission: NotificationPermissionsStatus | null) {
  if (!permission) return 'Not available';
  switch (permission.ios?.status) {
    case IosAuthorizationStatus.NOT_DETERMINED:
      return 'Not requested';
    case IosAuthorizationStatus.DENIED:
      return 'Denied';
    case IosAuthorizationStatus.AUTHORIZED:
      return 'Allowed';
    case IosAuthorizationStatus.PROVISIONAL:
      return 'Allowed quietly';
    case IosAuthorizationStatus.EPHEMERAL:
      return 'Allowed temporarily';
  }
  if (permission.granted) return 'Allowed';
  return permission.status === 'undetermined' ? 'Not requested' : 'Denied';
}
