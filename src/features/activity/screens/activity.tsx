import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Alert } from '@/components/ui/alert';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { apiRequest } from '@/lib/api/api-client';
import { useAppTheme } from '@/theme/theme-provider';

type ActivityItem = { id: string; title: string; body: string };
type NotificationItem = { id: string; title: string; body: string; read?: boolean };

export default function ActivityScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [activityResponse, notificationResponse] = await Promise.all([
        apiRequest<{ activity: ActivityItem[] }>('/api/protected/activity'),
        apiRequest<{ notifications: NotificationItem[] }>('/api/protected/notifications'),
      ]);
      setActivity(activityResponse.activity ?? []);
      setNotifications(notificationResponse.notifications ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen hasHeader contentStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText tone="muted">Recent account events and alerts.</AppText>
        <Pressable onPress={() => void load()} disabled={loading}>
          <AppText variant="caption" tone="primary">
            {loading ? 'Loading…' : 'Refresh'}
          </AppText>
        </Pressable>
      </View>

      {error ? <Alert title="Couldn’t load activity" body={error} tone="warning" /> : null}

      <View style={{ gap: spacing.sm }}>
        <AppText variant="eyebrow">Notifications</AppText>
        <Card style={{ gap: spacing.md }}>
          {notifications.length === 0 && !loading ? (
            <AppText tone="muted">No notifications yet.</AppText>
          ) : (
            notifications.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.md,
                    backgroundColor: colors.surfaceStrong,
                  }}>
                  <Icon name="bell" size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="subtitle">{item.title}</AppText>
                  <AppText tone="muted">{item.body}</AppText>
                </View>
              </View>
            ))
          )}
        </Card>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="eyebrow">Recent activity</AppText>
        <Card style={{ gap: spacing.md }}>
          {activity.length === 0 && !loading ? (
            <AppText tone="muted">No activity yet.</AppText>
          ) : (
            activity.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.md,
                    backgroundColor: colors.surfaceStrong,
                  }}>
                  <Icon name="clock" size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="subtitle">{item.title}</AppText>
                  <AppText tone="muted">{item.body}</AppText>
                </View>
              </View>
            ))
          )}
        </Card>
      </View>
    </Screen>
  );
}
