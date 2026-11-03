import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notifications.handled-responses.v1';

export async function claimResponse(key: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const stored: unknown = raw ? JSON.parse(raw) : [];
  const keys = Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : [];
  if (keys.includes(key)) return false;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...keys, key].slice(-100)));
  return true;
}

export function createNotificationResponseKey(identifier: string, date: number, action: string) {
  return JSON.stringify([identifier, date, action]);
}
