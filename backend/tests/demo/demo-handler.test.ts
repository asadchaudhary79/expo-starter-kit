import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession, reportServerError } = vi.hoisted(() => ({
  getSession: vi.fn(),
  reportServerError: vi.fn(),
}));

vi.mock('../../src/modules/auth/auth-server', () => ({
  getAuth: () => ({ api: { getSession } }),
}));

vi.mock('../../src/lib/report-error', () => ({ reportServerError }));

import {
  getProtectedActivity,
  getProtectedNotifications,
  getProtectedProfile,
  getProtectedWorkspace,
} from '../../src/controllers/protected.controller';
import {
  getPublicAnnouncements,
  getPublicPlans,
  getPublicStatus,
  getPublicTip,
} from '../../src/controllers/public.controller';

const completedUser = {
  id: 'user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  username: 'demo',
  onboardingCompleted: true,
};

describe('public API', () => {
  it('serves every public route without a session', async () => {
    const responses = [getPublicStatus(), getPublicTip(), getPublicAnnouncements(), getPublicPlans()];

    for (const response of responses) {
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
      expect(await response.json()).toBeTruthy();
    }
  });
});

describe('protected API authorization', () => {
  beforeEach(() => {
    getSession.mockReset();
    reportServerError.mockReset();
  });

  it('rejects every protected route without a server session', async () => {
    getSession.mockResolvedValue(null);
    const handlers = [getProtectedProfile, getProtectedWorkspace, getProtectedActivity, getProtectedNotifications];

    for (const handler of handlers) {
      const response = await handler(new Request('https://app.example.com/api/protected'));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(response.headers.get('Cache-Control')).toBe('private, no-store');
      expect(body.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('rejects an authenticated user who has not completed onboarding', async () => {
    getSession.mockResolvedValue({ user: { ...completedUser, onboardingCompleted: false } });

    const response = await getProtectedProfile(new Request('https://app.example.com/api/protected/profile'));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe('PROFILE_INCOMPLETE');
  });

  it('returns the signed-in profile for a completed account', async () => {
    getSession.mockResolvedValue({ user: completedUser });

    const response = await getProtectedProfile(new Request('https://app.example.com/api/protected/profile'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.profile).toEqual({
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@example.com',
      username: 'demo',
    });
  });

  it('reports an unexpected protected-request failure without returning details', async () => {
    getSession.mockRejectedValue(new Error('secret provider details'));

    const response = await getProtectedWorkspace(new Request('https://app.example.com/api/protected/workspace'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('REQUEST_FAILED');
    expect(reportServerError).toHaveBeenCalledWith({ event: 'protected.request-failed' });
  });
});
