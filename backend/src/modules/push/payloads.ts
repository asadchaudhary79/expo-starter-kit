import { randomUUID } from 'node:crypto';

export const PUSH_TOKEN_PATTERN = /^(Exponent|Expo)PushToken\[[A-Za-z0-9_-]+\]$/;

export type PushPayloadType =
  | 'basic'
  | 'data'
  | 'sound'
  | 'reminder'
  | 'badge'
  | 'clear-badge'
  | 'image'
  | 'action'
  | 'background';

export function createNotificationPayload(token: string, type: PushPayloadType = 'basic', imageUrl?: string) {
  if (!PUSH_TOKEN_PATTERN.test(token)) {
    throw new Error('Provide a valid Expo push token.');
  }

  const builders: Record<PushPayloadType, (token: string, imageUrl?: string) => Record<string, unknown>> = {
    basic: basicNotification,
    data: screenNotification,
    sound: customSoundNotification,
    reminder: reminderNotification,
    badge: badgeNotification,
    'clear-badge': clearBadgeNotification,
    image: imageNotification,
    action: actionNotification,
    background: backgroundNotification,
  };

  const payload = builders[type](token, imageUrl);
  if (Buffer.byteLength(JSON.stringify(payload)) > 3500) {
    throw new Error('Payload is too large. Shorten its content.');
  }
  return payload;
}

function basicNotification(token: string) {
  return {
    to: token,
    title: 'Hello from your API',
    body: 'This message travelled through Expo to your device.',
    sound: 'default',
    channelId: 'general',
  };
}

function screenNotification(token: string) {
  return {
    ...basicNotification(token),
    data: { url: '/notification/remote-demo', example: 'remote-demo' },
  };
}

function customSoundNotification(token: string) {
  return {
    ...basicNotification(token),
    title: 'A familiar sound',
    sound: 'notification.wav',
    channelId: 'custom-sound-ping',
  };
}

function reminderNotification(token: string) {
  return {
    ...basicNotification(token),
    title: 'Time for a little break',
    channelId: 'reminders',
  };
}

function badgeNotification(token: string) {
  return { ...basicNotification(token), badge: 1 };
}

function clearBadgeNotification(token: string) {
  return { ...basicNotification(token), title: 'Badge cleared', badge: 0 };
}

function imageNotification(token: string, imageUrl?: string) {
  if (!imageUrl) throw new Error('Set imageUrl to a public HTTPS image URL.');
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    throw new Error('Set imageUrl to a public HTTPS image URL.');
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Use a public HTTPS image URL without credentials.');
  }
  return {
    ...basicNotification(token),
    richContent: { image: url.href },
    mutableContent: true,
  };
}

function actionNotification(token: string) {
  return {
    ...basicNotification(token),
    title: 'A new message for you',
    body: 'Expand this notification and choose Mark as read.',
    categoryId: 'starter-actions',
    data: { url: '/notification/remote-demo', messageId: randomUUID() },
  };
}

function backgroundNotification(token: string) {
  return {
    to: token,
    _contentAvailable: true,
    priority: 'normal',
    data: { kind: 'background-demo', messageId: randomUUID() },
  };
}
