export function json(body: object, status = 200, cacheControl = 'public, max-age=60') {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': cacheControl },
  });
}

export function errorResponse(status: number, code: string, message: string) {
  return Response.json(
    { error: { code, message } },
    {
      status,
      headers: { 'Cache-Control': 'private, no-store' },
    },
  );
}
