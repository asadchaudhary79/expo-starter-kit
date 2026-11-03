import type { Notification, NotificationResponse } from 'expo-notifications';
import { router, useRootNavigationState } from 'expo-router';
import { createContext, use, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import { getNotificationDetailId } from './destination';

type Event = {
  id: number;
  time: string;
  kind: 'Received' | 'Tapped';
  title: string;
  body: string;
  note: string;
};

const ActivityContext = createContext<{
  events: Event[];
  error: string | null;
  clear: () => void;
} | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
  const navigation = useRootNavigationState();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const nextEventId = useRef(0);

  useEffect(() => {
    if (process.env.EXPO_OS === 'web' || !navigation?.key) return;
    let disposed = false;
    const subscriptions: { remove: () => void }[] = [];

    function recordNotificationActivity(notification: Notification, kind: Event['kind'], note: string) {
      const content = notification.request.content;
      const event: Event = {
        id: ++nextEventId.current,
        time: new Date().toLocaleTimeString(),
        kind,
        note,
        title: typeof content.title === 'string' ? content.title.slice(0, 160) : 'Notification',
        body: typeof content.body === 'string' ? content.body.slice(0, 500) : '',
      };
      setEvents((previous) => [event, ...previous].slice(0, 50));
    }

    async function startNotificationListeners() {
      const [Notifications, { claimResponse, createNotificationResponseKey }] = await Promise.all([
        import('expo-notifications'),
        import('./handled-responses'),
      ]);
      if (disposed) return;

      function clearHandledResponse(key: string) {
        const saved = Notifications.getLastNotificationResponse();
        if (!saved) return;
        const savedKey = createNotificationResponseKey(
          saved.notification.request.identifier,
          saved.notification.date,
          saved.actionIdentifier,
        );
        if (savedKey === key) Notifications.clearLastNotificationResponse();
      }

      async function handleNotificationTap(response: NotificationResponse) {
        if (disposed) return;
        const { notification, actionIdentifier } = response;
        const key = createNotificationResponseKey(
          notification.request.identifier,
          notification.date,
          actionIdentifier,
        );

        try {
          if (!(await claimResponse(key))) {
            clearHandledResponse(key);
            return;
          }
        } catch {
          setError('Could not save this notification tap. Navigation was skipped.');
          return;
        }

        const id = getNotificationDetailId(notification.request.content.data);
        const isNormalTap = actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER;
        let note = 'Action selected. Check Saved results for confirmation.';
        if (isNormalTap) {
          note = 'No supported destination. Stayed on the current screen.';
          if (id) note = `Opened detail: ${id}`;
        }

        recordNotificationActivity(notification, 'Tapped', note);
        if (isNormalTap && id) {
          router.navigate({ pathname: '/notification/[id]', params: { id } });
        }
        clearHandledResponse(key);
      }

      subscriptions.push(
        Notifications.addNotificationReceivedListener((notification) => {
          if (!disposed) recordNotificationActivity(notification, 'Received', 'Observed by the running app.');
        }),
      );
      subscriptions.push(
        Notifications.addNotificationResponseReceivedListener((response) => {
          void handleNotificationTap(response);
        }),
      );
      const initial = Notifications.getLastNotificationResponse();
      if (initial) void handleNotificationTap(initial);
    }

    void startNotificationListeners().catch(() => {
      if (!disposed) setError('Notification listeners could not start. Reload the app to retry.');
    });

    return () => {
      disposed = true;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [navigation?.key]);

  return <ActivityContext value={{ events, error, clear: () => setEvents([]) }}>{children}</ActivityContext>;
}

export function useNotificationActivity() {
  const value = use(ActivityContext);
  if (!value) throw new Error('useNotificationActivity requires NotificationProvider.');
  return value;
}
