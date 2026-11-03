import type { NotificationResponse } from 'expo-notifications';

export const ACTION_CATEGORY = 'starter-actions';
export const MARK_READ = 'mark-read';

export function messageId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const id = (data as Record<string, unknown>).messageId;
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

export function readActionId(response: NotificationResponse): string | null {
  if (
    response.actionIdentifier !== MARK_READ ||
    response.notification.request.content.categoryIdentifier !== ACTION_CATEGORY
  ) {
    return null;
  }
  return messageId(response.notification.request.content.data);
}

export function backgroundId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  let payload = (data as Record<string, unknown>).data;
  if (!payload || typeof payload !== 'object') return null;
  const encoded = (payload as Record<string, unknown>).dataString;
  if (typeof encoded === 'string') {
    if (encoded.length > 4096) return null;
    try {
      payload = JSON.parse(encoded);
    } catch {
      return null;
    }
  }
  if (
    !payload ||
    typeof payload !== 'object' ||
    (payload as Record<string, unknown>).kind !== 'background-demo'
  ) {
    return null;
  }
  return messageId(payload);
}
