import { errorResponse, json } from '../lib/api-response';
import { reportServerError } from '../lib/report-error';

export function getPublicStatus() {
  return servePublic(() =>
    json({
      service: {
        name: 'Expo Auth Starter API',
        status: 'ok',
        access: 'public',
      },
    }),
  );
}

export function getPublicTip() {
  return servePublic(() =>
    json({
      tip: {
        title: 'Public transmission received',
        body: 'Today’s reminder: drink some water, stretch, and pretend your inbox does not exist for five minutes.',
      },
    }),
  );
}

export function getPublicAnnouncements() {
  return servePublic(() =>
    json({
      announcements: [
        {
          id: 'welcome',
          title: 'Starter is ready',
          body: 'Public routes stay available without a session.',
        },
        {
          id: 'maintenance',
          title: 'No downtime planned',
          body: 'This sample list is safe to replace with your own announcements.',
        },
      ],
    }),
  );
}

export function getPublicPlans() {
  return servePublic(() =>
    json({
      plans: [
        { id: 'free', name: 'Free', price: '$0', summary: 'Sign in, verify email, and finish a profile.' },
        { id: 'team', name: 'Team', price: '$12', summary: 'A placeholder plan for a real billing catalog.' },
      ],
    }),
  );
}

function servePublic(respond: () => Response) {
  try {
    return respond();
  } catch {
    reportServerError({ event: 'public.request-failed' });
    return errorResponse(500, 'REQUEST_FAILED', 'We could not load this information. Please try again.');
  }
}
