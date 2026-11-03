import { errorResponse, json } from '../lib/api-response';
import { reportServerError } from '../lib/report-error';
import { getAuth } from '../modules/auth/auth-server';

const privateCache = 'private, no-store';

export function getProtectedProfile(request: Request) {
  return serveProtected(request, (user) =>
    json(
      {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
      200,
      privateCache,
    ),
  );
}

export function getProtectedWorkspace(request: Request) {
  return serveProtected(request, () =>
    json(
      {
        workspace: {
          title: 'Top secret unlocked',
          body: 'Your mission: finish one important task before opening another browser tab.',
        },
      },
      200,
      privateCache,
    ),
  );
}

export function getProtectedActivity(request: Request) {
  return serveProtected(request, (user) =>
    json(
      {
        activity: [
          { id: 'signed-in', title: 'Signed in', body: `${user.name} opened a protected route.` },
          { id: 'profile-ready', title: 'Profile ready', body: 'Onboarding is complete for this account.' },
        ],
      },
      200,
      privateCache,
    ),
  );
}

export function getProtectedNotifications(request: Request) {
  return serveProtected(request, () =>
    json(
      {
        notifications: [
          { id: 'welcome', title: 'Welcome', body: 'Only this signed-in account can read this.', read: false },
          { id: 'security', title: 'Security', body: 'Review app lock from the Profile tab when you are ready.', read: true },
        ],
      },
      200,
      privateCache,
    ),
  );
}

type AccountUser = {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  onboardingCompleted?: boolean | null;
};

async function serveProtected(request: Request, respond: (user: AccountUser) => Response) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });

    if (!session) {
      return errorResponse(401, 'UNAUTHORIZED', 'Sign in to view this information.');
    }

    if (!session.user.onboardingCompleted) {
      return errorResponse(403, 'PROFILE_INCOMPLETE', 'Complete your profile to continue.');
    }

    return respond(session.user);
  } catch {
    reportServerError({ event: 'protected.request-failed' });
    return errorResponse(500, 'REQUEST_FAILED', 'We could not load this information. Please try again.');
  }
}
