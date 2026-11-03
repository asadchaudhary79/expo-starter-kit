import { Readable } from 'node:stream';

import type { Request, Response } from 'express';

export function toWebRequest(req: Request) {
  const forwardedProtocol = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol;
  const url = `${protocol || req.protocol || 'http'}://${req.headers.host ?? 'localhost'}${req.originalUrl}`;
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
  }

  const method = req.method.toUpperCase();

  if (method === 'GET' || method === 'HEAD') {
    return new Request(url, { method, headers });
  }

  return new Request(url, {
    method,
    headers,
    body: Readable.toWeb(req) as ReadableStream,
    duplex: 'half',
  } as RequestInit);
}

export async function sendWebResponse(res: Response, response: globalThis.Response) {
  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });

  const setCookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  if (setCookies.length > 0) res.setHeader('set-cookie', setCookies);

  res.end(Buffer.from(await response.arrayBuffer()));
}
