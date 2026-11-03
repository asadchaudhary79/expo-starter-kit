import { Platform } from 'react-native';

import { ACTION_CATEGORY } from './actions';
import { CUSTOM_SOUND_CHANNEL_ID, GENERAL_CHANNEL_ID, REMINDERS_CHANNEL_ID } from './channels';
import { canReceiveNotifications, readNotificationPermission } from './permissions';

export const DAILY_REMINDER_ID = 'starter-daily-reminder';

async function getNotificationsApi() {
  if (Platform.OS === 'web') {
    throw new Error('Open the iOS or Android app to try notifications.');
  }
  return import('expo-notifications');
}

async function requireNotificationPermission() {
  const Notifications = await getNotificationsApi();
  const permission = await readNotificationPermission();
  if (!canReceiveNotifications(permission)) {
    throw new Error('Enable notifications first.');
  }
  return Notifications;
}

export async function sendImmediateNotification() {
  const Notifications = await requireNotificationPermission();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hello from your device',
      body: 'Created on this device. No server needed.',
      sound: 'default',
      data: { url: '/notification/local-immediate' },
    },
    trigger: Platform.OS === 'android' ? { channelId: GENERAL_CHANNEL_ID } : null,
  });
}

export async function scheduleReminder() {
  const Notifications = await requireNotificationPermission();
  const delaySeconds = 10;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your reminder is here',
      body: 'Created on this device. No server needed.',
      sound: 'default',
      data: {
        url: '/notification/local-delayed',
        expectedAt: Date.now() + delaySeconds * 1000,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
      repeats: false,
      channelId: REMINDERS_CHANNEL_ID,
    },
  });
}

export async function scheduleDailyReminder() {
  const Notifications = await requireNotificationPermission();
  return Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Time for a little break',
      body: 'Created on this device. No server needed.',
      sound: 'default',
      data: { url: '/notification/local-daily' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
      channelId: REMINDERS_CHANNEL_ID,
    },
  });
}

export async function sendCustomSoundNotification() {
  const Notifications = await requireNotificationPermission();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'That sound came with the app',
      body: 'Created on this device. No server needed.',
      sound: 'notification.wav',
      data: { url: '/notification/local-sound' },
    },
    trigger: Platform.OS === 'android' ? { channelId: CUSTOM_SOUND_CHANNEL_ID } : null,
  });
}

export async function scheduleActionNotification() {
  const Notifications = await requireNotificationPermission();
  const setup = await import('./setup');
  await setup.notificationSetup;
  if (setup.notificationSetupError) throw new Error(setup.notificationSetupError);
  const messageId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const delaySeconds = 10;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'A message you can mark as read',
      body: 'Expand this notification and choose Mark as read.',
      categoryIdentifier: ACTION_CATEGORY,
      sound: 'default',
      data: {
        url: '/notification/local-action',
        messageId,
        expectedAt: Date.now() + delaySeconds * 1000,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
      repeats: false,
      channelId: GENERAL_CHANNEL_ID,
    },
  });
}

function describeSchedule(identifier: string, expectedAt: unknown) {
  if (identifier === DAILY_REMINDER_ID) return 'Every day at 9:00 AM (device time)';
  if (typeof expectedAt === 'number') return `Requested for ${new Date(expectedAt).toLocaleTimeString()}`;
  return 'Scheduled on this device';
}

export async function getPendingNotifications() {
  const Notifications = await getNotificationsApi();
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  return pending.map((request) => ({
    identifier: request.identifier,
    title: request.content.title ?? 'Reminder',
    when: describeSchedule(request.identifier, request.content.data?.expectedAt),
  }));
}

export async function cancelScheduledNotification(identifier: string) {
  const Notifications = await getNotificationsApi();
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllScheduledNotifications() {
  const Notifications = await getNotificationsApi();
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setBadgeCount(count: number) {
  const Notifications = count > 0 ? await requireNotificationPermission() : await getNotificationsApi();
  const updated = await Notifications.setBadgeCountAsync(count);
  if (!updated) throw new Error('Badges are unavailable or not allowed on this device.');
}

export async function incrementBadgeCount() {
  const Notifications = await requireNotificationPermission();
  const currentCount = await Notifications.getBadgeCountAsync();
  const nextCount = currentCount + 1;
  await setBadgeCount(nextCount);
  return nextCount;
}
