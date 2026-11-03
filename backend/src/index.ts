import './config/load-env';

import { getServerEnv } from './config/env';
import { createApiServer } from './app';

const env = getServerEnv();
const port = resolveListenPort(env.BETTER_AUTH_URL);
const server = createApiServer();

server.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://localhost:${port}`);
});

function resolveListenPort(authUrl: string) {
  if (process.env.PORT) return Number(process.env.PORT);

  const port = new URL(authUrl).port;
  return port ? Number(port) : 3000;
}
