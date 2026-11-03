import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Alert } from '@/components/ui/alert';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { apiRequest } from '@/lib/api/api-client';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

import { savedResults } from '../action-store';
import {
  cancelAllScheduledNotifications,
  getPendingNotifications,
  incrementBadgeCount,
  scheduleActionNotification,
  scheduleDailyReminder,
  scheduleReminder,
  sendCustomSoundNotification,
  sendImmediateNotification,
  setBadgeCount,
} from '../local';
import { useNotificationActivity } from '../notification-provider';
import { canReceiveNotifications, permissionLabel } from '../permissions';
import { usePushRegistration } from '../push-provider';
import { useNotificationPermission } from '../use-notification-permission';

export default function NotificationsLabScreen() {
  const { spacing } = useAppTheme();
  const permissionState = useNotificationPermission();
  const push = usePushRegistration();
  const activity = useNotificationActivity();
  const [pending, setPending] = useState<{ identifier: string; title: string; when: string }[]>([]);
  const [saved, setSaved] = useState<{ kind: string; messageId: string; time: string }[]>([]);
  const [sending, setSending] = useState(false);
  const allowed = canReceiveNotifications(permissionState.permission);

  const refreshSaved = useCallback(async () => {
    try {
      setSaved(await savedResults());
    } catch (error) {
      appToast.error('Could not load saved results', {
        description: error instanceof Error ? error.message : 'Try again.',
      });
    }
  }, []);

  const refreshPending = useCallback(async () => {
    try {
      setPending(await getPendingNotifications());
    } catch (error) {
      appToast.error('Could not load scheduled notifications', {
        description: error instanceof Error ? error.message : 'Try again.',
      });
    }
  }, []);

  useEffect(() => {
    void refreshSaved();
  }, [refreshSaved]);

  async function runLocal(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      appToast.success(success);
      await refreshPending();
      await refreshSaved();
    } catch (error) {
      appToast.error('Notification action failed', {
        description: error instanceof Error ? error.message : 'Try again.',
      });
    }
  }

  async function sendTestPush(type: 'basic' | 'data' | 'action') {
    setSending(true);
    try {
      await apiRequest('/api/push/send', {
        method: 'POST',
        body: { type },
      });
      appToast.success('Push queued through Expo');
    } catch (error) {
      appToast.error('Could not send push', {
        description: error instanceof Error ? error.message : 'Try again.',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen hasHeader contentStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
      <AppText tone="muted">Local scheduling, Expo push registration, and backend send helpers.</AppText>

      <Card style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Permission</AppText>
        <AppText tone="muted">{permissionLabel(permissionState.permission)}</AppText>
        {permissionState.error ? <Alert title="Permission error" body={permissionState.error} tone="warning" /> : null}
        <Button
          label={permissionState.openSettings ? 'Open settings' : 'Enable notifications'}
          loading={permissionState.loading}
          disabled={!permissionState.supported}
          onPress={() => void permissionState.act()}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Local notifications</AppText>
        <Button label="Send now" disabled={!allowed} onPress={() => void runLocal(sendImmediateNotification, 'Sent')} />
        <Button label="Remind in 10s" disabled={!allowed} onPress={() => void runLocal(scheduleReminder, 'Scheduled')} />
        <Button
          label="Daily 9:00 AM"
          disabled={!allowed}
          onPress={() => void runLocal(scheduleDailyReminder, 'Daily reminder set')}
        />
        <Button
          label="Custom sound"
          disabled={!allowed}
          onPress={() => void runLocal(sendCustomSoundNotification, 'Sent with sound')}
        />
        <Button
          label="Action button (10s)"
          disabled={!allowed}
          onPress={() => void runLocal(scheduleActionNotification, 'Action notification scheduled')}
        />
        <Button label="Badge +1" disabled={!allowed} onPress={() => void runLocal(incrementBadgeCount, 'Badge updated')} />
        <Button label="Clear badge" onPress={() => void runLocal(() => setBadgeCount(0), 'Badge cleared')} />
        <Button
          label="Cancel all scheduled"
          variant="outline"
          onPress={() => void runLocal(cancelAllScheduledNotifications, 'Cancelled')}
        />
        <Button label="Refresh pending" variant="outline" onPress={() => void refreshPending()} />
        {pending.length === 0 ? (
          <AppText tone="muted">No pending schedules.</AppText>
        ) : (
          pending.map((item) => (
            <View key={item.identifier} style={{ gap: 2 }}>
              <AppText variant="subtitle">{item.title}</AppText>
              <AppText variant="caption" tone="muted">
                {item.when}
              </AppText>
            </View>
          ))
        )}
      </Card>

      <Card style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Remote push</AppText>
        <Button
          label={push.busy ? 'Registering…' : 'Register Expo push token'}
          loading={push.busy}
          disabled={!allowed}
          onPress={() => void push.registerForPushNotifications()}
        />
        {push.token ? (
          <>
            <AppText variant="caption" tone="muted" selectable>
              {push.token}
            </AppText>
            <AppText tone="muted">{push.synced ? 'Synced with backend' : 'Registered locally only'}</AppText>
            <Button
              label="Copy token"
              variant="outline"
              onPress={() => {
                void Clipboard.setStringAsync(push.token!);
                appToast.success('Token copied');
              }}
            />
            <Button label="Send basic push" loading={sending} onPress={() => void sendTestPush('basic')} />
            <Button label="Send deep-link push" loading={sending} onPress={() => void sendTestPush('data')} />
            <Button label="Send action push" loading={sending} onPress={() => void sendTestPush('action')} />
          </>
        ) : null}
        {push.error ? <Alert title="Push registration" body={push.error} tone="warning" /> : null}
      </Card>

      <Card style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Live activity</AppText>
        {activity.error ? <Alert title="Listener error" body={activity.error} tone="warning" /> : null}
        {activity.events.length === 0 ? (
          <AppText tone="muted">No received or tapped events yet.</AppText>
        ) : (
          activity.events.slice(0, 8).map((event) => (
            <View key={event.id} style={{ gap: 2 }}>
              <AppText variant="subtitle">
                {event.kind}: {event.title}
              </AppText>
              <AppText variant="caption" tone="muted">
                {event.time} · {event.note}
              </AppText>
            </View>
          ))
        )}
        <Button label="Clear activity" variant="outline" onPress={activity.clear} />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Saved action results</AppText>
        <Button label="Refresh saved" variant="outline" onPress={() => void refreshSaved()} />
        {saved.length === 0 ? (
          <AppText tone="muted">No Mark as read / background results yet.</AppText>
        ) : (
          saved.slice(0, 10).map((item) => (
            <AppText key={`${item.kind}-${item.messageId}`} variant="caption" tone="muted">
              {item.kind}: {item.messageId}
            </AppText>
          ))
        )}
      </Card>
    </Screen>
  );
}
