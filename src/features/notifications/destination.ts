export function getNotificationDetailId(data: unknown): string | null {
  if (!data || typeof data !== 'object' || !('url' in data)) return null;
  if (typeof data.url !== 'string') return null;

  const match = /^\/notification\/([A-Za-z0-9_-]{1,64})$/.exec(data.url);
  return match?.[1] ?? null;
}
