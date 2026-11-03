import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/theme/theme-provider';

export default function NotificationDetailScreen() {
  const { spacing } = useAppTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <Screen hasHeader contentStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
      <Card style={{ gap: spacing.md }}>
        <AppText variant="eyebrow">Notification</AppText>
        <AppText variant="title">{id ?? 'Unknown'}</AppText>
        <AppText tone="muted">
          This detail route opened from a notification `data.url` deep link. Replace this screen with your product
          destination.
        </AppText>
      </Card>
      <View />
    </Screen>
  );
}
