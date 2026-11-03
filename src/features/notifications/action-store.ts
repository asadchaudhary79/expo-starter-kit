import { apiRequest } from '@/lib/api/api-client';

export type SavedResult = { kind: 'read' | 'background'; messageId: string; time: string };

export async function saveResult(kind: SavedResult['kind'], messageId: string) {
  await apiRequest('/api/push/results', {
    method: 'POST',
    body: { kind, messageId },
  });
}

export async function savedResults(): Promise<SavedResult[]> {
  const response = await apiRequest<{ results: SavedResult[] }>('/api/push/results');
  return response.results ?? [];
}
