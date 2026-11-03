import express, { type NextFunction, type Request, type Response } from 'express';

import { createAuthController } from './controllers/auth.controller';
import { GET as getHealth } from './controllers/health.controller';
import { PATCH as completeOnboarding } from './controllers/onboarding.controller';
import { PATCH as updateProfile } from './controllers/profile.controller';
import {
  getProtectedActivity,
  getProtectedNotifications,
  getProtectedProfile,
  getProtectedWorkspace,
} from './controllers/protected.controller';
import { getPublicAnnouncements, getPublicPlans, getPublicStatus, getPublicTip } from './controllers/public.controller';
import {
  listNotificationResults,
  registerPushToken,
  saveNotificationResult,
  sendPushToMe,
  unregisterPushToken,
} from './controllers/push.controller';
import { sendWebResponse, toWebRequest } from './lib/http';
import { apiCors } from './middleware/cors';

export function createApiServer() {
  const app = express();
  const authHandler = createAuthController();

  app.disable('x-powered-by');
  app.use(apiCors);
  app.get('/', (_req, res) => {
    res.json({
      name: 'Expo Auth Starter API',
      status: 'ok',
      routes: {
        health: 'GET /api/health',
        auth: '/api/auth/*',
        public: 'GET /api/public/status | /tip | /announcements | /plans',
        protected: 'GET /api/protected/profile | /workspace | /activity | /notifications',
        updateProfile: 'PATCH /api/protected/profile',
        onboarding: 'PATCH /api/onboarding',
        push: 'POST /api/push/register | DELETE /api/push/unregister | POST /api/push/send | GET+POST /api/push/results',
      },
    });
  });
  app.use('/api/auth', (req, res, next) => {
    Promise.resolve(authHandler(req, res)).catch(next);
  });

  app.get('/api/health', asyncHandler(async (_req, res) => {
    await sendWebResponse(res, await getHealth());
  }));

  app.get('/api/public/status', asyncHandler(async (_req, res) => {
    await sendWebResponse(res, getPublicStatus());
  }));
  app.get('/api/public/tip', asyncHandler(async (_req, res) => {
    await sendWebResponse(res, getPublicTip());
  }));
  app.get('/api/public/announcements', asyncHandler(async (_req, res) => {
    await sendWebResponse(res, getPublicAnnouncements());
  }));
  app.get('/api/public/plans', asyncHandler(async (_req, res) => {
    await sendWebResponse(res, getPublicPlans());
  }));

  app.get('/api/protected/profile', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await getProtectedProfile(toWebRequest(req)));
  }));
  app.patch('/api/protected/profile', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await updateProfile(toWebRequest(req)));
  }));
  app.get('/api/protected/workspace', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await getProtectedWorkspace(toWebRequest(req)));
  }));
  app.get('/api/protected/activity', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await getProtectedActivity(toWebRequest(req)));
  }));
  app.get('/api/protected/notifications', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await getProtectedNotifications(toWebRequest(req)));
  }));

  app.patch('/api/onboarding', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await completeOnboarding(toWebRequest(req)));
  }));

  app.post('/api/push/register', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await registerPushToken(toWebRequest(req)));
  }));
  app.delete('/api/push/unregister', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await unregisterPushToken(toWebRequest(req)));
  }));
  app.post('/api/push/send', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await sendPushToMe(toWebRequest(req)));
  }));
  app.get('/api/push/results', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await listNotificationResults(toWebRequest(req)));
  }));
  app.post('/api/push/results', asyncHandler(async (req, res) => {
    await sendWebResponse(res, await saveNotificationResult(toWebRequest(req)));
  }));

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'This API route does not exist.',
      },
    });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const detail = error instanceof Error ? error.message : 'request failed';
    console.error('[api] request failed:', detail);

    if (res.headersSent) return;

    res.status(500).json({
      error: {
        code: 'REQUEST_FAILED',
        message: 'We could not complete this request. Please try again.',
      },
    });
  });

  return app;
}

function asyncHandler(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}
