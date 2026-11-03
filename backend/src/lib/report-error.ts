export type ServerErrorReport =
  | { event: 'public.request-failed' }
  | { event: 'protected.request-failed' }
  | { event: 'email.delivery-failed'; purpose: AuthEmailPurpose; providerStatus?: number }
  | { event: 'health.database-check-failed' }
  | { event: 'onboarding.profile-update-failed' }
  | { event: 'profile.update-failed' };

type AuthEmailPurpose = 'sign-in' | 'email-verification' | 'forget-password' | 'change-email';

/**
 * Replace this function body with a server-side monitoring SDK when needed.
 * Reports are deliberately compile-time allowlisted and never accept an Error,
 * request, email address, OTP, cookie, token, headers, or arbitrary metadata.
 */
export function reportServerError(report: ServerErrorReport) {
  try {
    console.error('[server-error]', JSON.stringify(report));
  } catch {
    // Monitoring must never change the application response.
  }
}
