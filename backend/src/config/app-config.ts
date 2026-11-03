import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type AppIdentity = {
  name: string;
  slug: string;
  scheme: string;
  iosBundleIdentifier: string;
  androidPackage: string;
};

const identityPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../app-identity.json');

export const appConfig = JSON.parse(readFileSync(identityPath, 'utf8')) as AppIdentity;
