import { describe, expect, it } from 'vitest';

import {
  normalizeApiBaseUrl,
  resolveNativeApiBaseUrl,
} from '@/lib/api/api-origin';

describe('development API origins', () => {
  it('maps Android emulator loopback to the host machine and keeps the API port', () => {
    expect(resolveNativeApiBaseUrl('http://localhost:3000', '127.0.0.1:8081', 'android')).toBe(
      'http://10.0.2.2:3000',
    );
  });

  it('uses the Expo LAN address with the Express API port', () => {
    expect(resolveNativeApiBaseUrl('http://localhost:3000', '192.168.1.20:8081', 'android')).toBe(
      'http://192.168.1.20:3000',
    );
    expect(resolveNativeApiBaseUrl('http://localhost:3000', '192.168.1.20:8081', 'ios')).toBe(
      'http://192.168.1.20:3000',
    );
  });

  it('uses platform-safe fallbacks when Expo has no host address', () => {
    expect(resolveNativeApiBaseUrl('http://localhost:3000', null, 'android')).toBe('http://10.0.2.2:3000');
    expect(resolveNativeApiBaseUrl('http://localhost:3000', null, 'ios')).toBe('http://localhost:3000');
  });
});

describe('deployed API origins', () => {
  it('normalizes paths to an origin', () => {
    expect(normalizeApiBaseUrl('https://api.example.com/path', 'production')).toBe('https://api.example.com');
  });

  it('rejects insecure staging and production origins', () => {
    expect(() => normalizeApiBaseUrl('http://api.example.com', 'staging')).toThrow('require an https:// origin');
    expect(() => normalizeApiBaseUrl('http://api.example.com', 'production')).toThrow('require an https:// origin');
  });
});
