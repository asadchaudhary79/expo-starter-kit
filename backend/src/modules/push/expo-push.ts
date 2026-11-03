import { setTimeout as delay } from 'node:timers/promises';

type ExpoFetch = typeof fetch;

type ExpoRequestOptions = {
  accessToken?: string;
  fetcher?: ExpoFetch;
  sleep?: typeof delay;
};

export async function sendPushNotification(payload: unknown, options: ExpoRequestOptions = {}) {
  const ticket = await requestExpo('send', payload, options);
  checkStatus(ticket);
  if (!ticket || typeof ticket !== 'object') {
    throw new Error('Accepted response did not contain a valid ticket ID.');
  }
  const id = (ticket as { id?: unknown }).id;
  if (typeof id !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) {
    throw new Error('Accepted response did not contain a valid ticket ID.');
  }
  return ticket as { id: string; status: string };
}

export async function getPushReceipt(ticketId: string, options: ExpoRequestOptions = {}) {
  if (typeof ticketId !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(ticketId)) {
    throw new Error('Provide a valid ticket ID from the send command.');
  }
  const receipts = await requestExpo('getReceipts', { ids: [ticketId] }, options);
  if (!receipts || typeof receipts !== 'object' || Array.isArray(receipts)) {
    throw new Error('Unexpected receipt response.');
  }
  const receipt = (receipts as Record<string, unknown>)[ticketId];
  if (!receipt) return null;
  checkStatus(receipt);
  return receipt;
}

export function redact(value: string) {
  return String(value).replace(/(?:Exponent|Expo)PushToken\[[^\]]*\]/g, '[push token hidden]');
}

async function requestExpo(path: 'send' | 'getReceipts', body: unknown, options: ExpoRequestOptions) {
  const fetcher = options.fetcher ?? fetch;
  const sleep = options.sleep ?? delay;

  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try {
      response = await fetcher(`https://exp.host/--/api/v2/push/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new Error('Network request failed or timed out. Delivery is unknown; sending again may duplicate it.');
    }

    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await response.body?.cancel();
      await sleep(1000 * 2 ** attempt);
      continue;
    }

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Expo returned a non-JSON response (HTTP ${response.status}).`);
    }

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('Unexpected Expo response: expected an object.');
    }

    const record = result as { errors?: unknown; data?: unknown };
    if (!response.ok || (Array.isArray(record.errors) && record.errors.length > 0)) {
      throw new Error(
        redact(`Expo request failed (HTTP ${response.status}): ${JSON.stringify(record.errors ?? result)}`),
      );
    }
    return record.data;
  }

  throw new Error('Expo request failed after retries.');
}

function checkStatus(result: unknown) {
  if (!result || typeof result !== 'object') {
    throw new Error('Unexpected Expo response: missing notification status.');
  }
  const record = result as { status?: string; details?: { error?: string }; message?: string };
  if (record.status === 'error') {
    const code = record.details?.error ?? 'UnknownError';
    const hint = code === 'DeviceNotRegistered' ? ' Stop using this token until the app registers again.' : '';
    throw new Error(redact(`${code}: ${record.message ?? JSON.stringify(record.details)}${hint}`));
  }
  if (record.status !== 'ok') throw new Error('Unexpected Expo response: missing notification status.');
}
