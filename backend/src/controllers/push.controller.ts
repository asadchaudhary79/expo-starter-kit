import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { getServerEnv } from '../config/env';
import { getDatabase } from '../db';
import { notificationResult } from '../db/notification-schema';
import { pushToken } from '../db/push-schema';
import { errorResponse, json } from '../lib/api-response';
import { reportServerError } from '../lib/report-error';
import { getAuth } from '../modules/auth/auth-server';
import { sendPushNotification } from '../modules/push/expo-push';
import { PUSH_TOKEN_PATTERN, createNotificationPayload, type PushPayloadType } from '../modules/push/payloads';

const privateCache = 'private, no-store';

const registerSchema = z.object({
  token: z.string().regex(PUSH_TOKEN_PATTERN, 'Provide a valid Expo push token.'),
  platform: z.string().max(32).optional(),
});

const unregisterSchema = z.object({
  token: z.string().regex(PUSH_TOKEN_PATTERN, 'Provide a valid Expo push token.'),
});

const sendSchema = z.object({
  type: z
    .enum(['basic', 'data', 'sound', 'reminder', 'badge', 'clear-badge', 'image', 'action', 'background'])
    .default('basic'),
  imageUrl: z.string().url().optional(),
  token: z.string().regex(PUSH_TOKEN_PATTERN).optional(),
});

const resultSchema = z.object({
  kind: z.enum(['read', 'background']),
  messageId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, 'Invalid message id.'),
});

type AccountUser = {
  id: string;
  onboardingCompleted?: boolean | null;
};

export async function registerPushToken(request: Request) {
  return serveProtected(request, async (user) => {
    const body = await readJson(request);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid push token payload.');
    }

    const db = getDatabase();
    const [existing] = await db.select().from(pushToken).where(eq(pushToken.token, parsed.data.token)).limit(1);

    if (existing) {
      await db
        .update(pushToken)
        .set({
          userId: user.id,
          platform: parsed.data.platform ?? existing.platform,
          disabled: false,
          updatedAt: new Date(),
        })
        .where(eq(pushToken.id, existing.id));
    } else {
      await db.insert(pushToken).values({
        id: randomUUID(),
        userId: user.id,
        token: parsed.data.token,
        platform: parsed.data.platform,
        disabled: false,
      });
    }

    return json({ ok: true }, 200, privateCache);
  });
}

export async function unregisterPushToken(request: Request) {
  return serveProtected(request, async (user) => {
    const body = await readJson(request);
    const parsed = unregisterSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid push token payload.');
    }

    const db = getDatabase();
    await db
      .update(pushToken)
      .set({ disabled: true, updatedAt: new Date() })
      .where(and(eq(pushToken.userId, user.id), eq(pushToken.token, parsed.data.token)));

    return json({ ok: true }, 200, privateCache);
  });
}

export async function sendPushToMe(request: Request) {
  return serveProtected(request, async (user) => {
    const body = await readJson(request);
    const parsed = sendSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return errorResponse(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid push send payload.');
    }

    const db = getDatabase();
    const tokens = parsed.data.token
      ? [{ token: parsed.data.token }]
      : await db
          .select({ token: pushToken.token })
          .from(pushToken)
          .where(and(eq(pushToken.userId, user.id), eq(pushToken.disabled, false)));

    if (tokens.length === 0) {
      return errorResponse(404, 'NO_PUSH_TOKEN', 'Register a push token on this account first.');
    }

    const env = getServerEnv();
    const tickets = [];

    for (const row of tokens) {
      try {
        const payload = createNotificationPayload(
          row.token,
          parsed.data.type as PushPayloadType,
          parsed.data.imageUrl,
        );
        const ticket = await sendPushNotification(payload, {
          accessToken: env.EXPO_ACCESS_TOKEN,
        });
        tickets.push({ token: row.token, ticketId: ticket.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Push send failed.';
        if (message.includes('DeviceNotRegistered')) {
          await db
            .update(pushToken)
            .set({ disabled: true, updatedAt: new Date() })
            .where(eq(pushToken.token, row.token));
        }
        tickets.push({ token: row.token, error: message });
      }
    }

    return json({ tickets }, 200, privateCache);
  });
}

export async function saveNotificationResult(request: Request) {
  return serveProtected(request, async (user) => {
    const body = await readJson(request);
    const parsed = resultSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid notification result.');
    }

    const db = getDatabase();
    try {
      await db.insert(notificationResult).values({
        id: randomUUID(),
        userId: user.id,
        kind: parsed.data.kind,
        messageId: parsed.data.messageId,
      });
    } catch {
      // Unique (user, kind, messageId) — ignore duplicates from retries.
    }

    return json({ ok: true }, 200, privateCache);
  });
}

export async function listNotificationResults(request: Request) {
  return serveProtected(request, async (user) => {
    const db = getDatabase();
    const rows = await db
      .select({
        kind: notificationResult.kind,
        messageId: notificationResult.messageId,
        createdAt: notificationResult.createdAt,
      })
      .from(notificationResult)
      .where(eq(notificationResult.userId, user.id))
      .orderBy(desc(notificationResult.createdAt))
      .limit(100);

    return json(
      {
        results: rows.map((row) => ({
          kind: row.kind,
          messageId: row.messageId,
          time: row.createdAt.toISOString(),
        })),
      },
      200,
      privateCache,
    );
  });
}

async function serveProtected(request: Request, respond: (user: AccountUser) => Promise<Response>) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sign in to manage push notifications.');
    if (!session.user.onboardingCompleted) {
      return errorResponse(403, 'PROFILE_INCOMPLETE', 'Complete your profile to continue.');
    }
    return respond(session.user);
  } catch {
    reportServerError({ event: 'protected.request-failed' });
    return errorResponse(500, 'REQUEST_FAILED', 'We could not complete this push request. Please try again.');
  }
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
