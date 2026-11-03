import { useEffect, useRef } from 'react';

import { useAuth } from '@/features/auth/auth-provider';
import { usePushRegistration } from '@/features/notifications/push-provider';

/** Clears the backend push token when the signed-in session ends. */
export function PushSessionBridge() {
  const { phase } = useAuth();
  const { token, unregisterFromBackend } = usePushRegistration();
  const previousPhase = useRef(phase);

  useEffect(() => {
    const wasReady = previousPhase.current === 'ready' || previousPhase.current === 'needs-onboarding';
    previousPhase.current = phase;

    if (wasReady && phase === 'signed-out' && token) {
      void unregisterFromBackend();
    }
  }, [phase, token, unregisterFromBackend]);

  return null;
}
