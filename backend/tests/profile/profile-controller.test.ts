import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession, returning, set, update, where, reportServerError } = vi.hoisted(() => {
  const returning = vi.fn();
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));
  const update = vi.fn(() => ({ set }));

  return {
    getSession: vi.fn(),
    returning,
    set,
    update,
    where,
    reportServerError: vi.fn(),
  };
});

vi.mock('../../src/modules/auth/auth-server', () => ({
  getAuth: () => ({ api: { getSession } }),
}));

vi.mock('../../src/db', () => ({
  getDatabase: () => ({ update }),
}));

vi.mock('../../src/lib/report-error', () => ({ reportServerError }));

import { PATCH } from '../../src/controllers/profile.controller';

describe('profile update API', () => {
  beforeEach(() => {
    getSession.mockReset();
    reportServerError.mockReset();
    update.mockClear();
    set.mockClear();
    where.mockClear();
    returning.mockReset();
  });

  it('rejects unsigned requests', async () => {
    getSession.mockResolvedValue(null);

    const response = await PATCH(
      new Request('https://app.example.com/api/protected/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Asad', username: 'asad' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(401);
  });

  it('updates name and username for a completed account', async () => {
    getSession.mockResolvedValue({
      user: { id: 'user-1', onboardingCompleted: true },
    });
    returning.mockResolvedValue([
      {
        id: 'user-1',
        name: 'Asad Chaudhary',
        email: 'test@zeitfilter.com',
        username: 'asadchaudhary',
      },
    ]);

    const response = await PATCH(
      new Request('https://app.example.com/api/protected/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Asad Chaudhary', username: 'asadchaudhary' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.username).toBe('asadchaudhary');
    expect(set).toHaveBeenCalledWith({
      name: 'Asad Chaudhary',
      username: 'asadchaudhary',
    });
  });
});
