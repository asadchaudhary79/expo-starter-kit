import { Platform } from 'react-native';

export const GENERAL_CHANNEL_ID = 'general';
export const REMINDERS_CHANNEL_ID = 'reminders';
export const CUSTOM_SOUND_CHANNEL_ID = 'custom-sound-ping';

export async function ensureNotificationChannels() {
  if (Platform.OS !== 'android') return;

  const Notifications = await import('expo-notifications');
  await Notifications.setNotificationChannelAsync(GENERAL_CHANNEL_ID, {
    name: 'General',
    description: 'General app notifications',
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
    name: 'Reminders',
    description: 'Scheduled and remote reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync(CUSTOM_SOUND_CHANNEL_ID, {
    name: 'Custom sound',
    description: 'Notifications using the bundled sound',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'notification.wav',
  });
}
