import { toNodeHandler } from 'better-auth/node';

import { getAuth } from '../modules/auth/auth-server';

export function createAuthController() {
  return toNodeHandler(getAuth());
}
