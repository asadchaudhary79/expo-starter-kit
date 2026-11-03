import type { NextFunction, Request, Response } from 'express';

import { appConfig } from '../config/app-config';
import { getServerEnv } from '../config/env';

export function apiCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('origin');

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  const requestedHeaders = req.get('access-control-request-headers');
  res.setHeader(
    'Access-Control-Allow-Headers',
    requestedHeaders ?? 'Content-Type, Authorization, Cookie, expo-origin',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

function isAllowedOrigin(origin: string) {
  const env = getServerEnv();

  if (env.NODE_ENV === 'development') return true;
  if (origin === new URL(env.BETTER_AUTH_URL).origin) return true;
  if (env.AUTH_TRUSTED_ORIGINS.includes(origin)) return true;

  return origin === `${appConfig.scheme}://` || origin.startsWith(`${appConfig.scheme}://`);
}
