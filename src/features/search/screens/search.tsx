import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { useAppTheme } from '@/theme/theme-provider';

const catalog = [
  {
    id: 'calendar',
    title: 'Calendar',
    body: 'Month view with sample events',
    href: '/calendar' as const,
    icon: 'calendar' as const,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    body: 'Local schedules and Expo push tokens',
    href: '/notifications' as const,
    icon: 'bell' as const,
  },
  {
    id: 'profile',
    title: 'Edit profile',
    body: 'Update name, username, and photo',
    href: '/edit-profile' as const,
    icon: 'person' as const,
  },
  {
    id: 'security',
    title: 'App lock',
    body: 'Face ID, Touch ID, or biometrics',
    href: '/biometric-lock' as const,
    icon: 'lock' as const,
  },
  {
    id: 'public',
    title: 'Public tip',
    body: 'Open a page that works without sign-in',
    href: '/public' as const,
    icon: 'info' as const,
  },
];

export default function SearchScreen() {
  const { colors, motion, radius, spacing } = useAppTheme();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog.filter(
      (item) => item.title.toLowerCase().includes(needle) || item.body.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <Screen hasHeader contentStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
      <SearchField
        placeholder="Search pages and features"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />

      <AppText variant="caption" tone="muted">
        {results.length} result{results.length === 1 ? '' : 's'}
      </AppText>

      <Card style={{ paddingVertical: spacing.sm, gap: 0 }}>
        {results.length === 0 ? (
          <View style={{ padding: spacing.lg, gap: spacing.xs }}>
            <AppText variant="subtitle">No results</AppText>
            <AppText tone="muted">Try a different keyword.</AppText>
          </View>
        ) : (
          results.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <View style={{ height: 1, marginLeft: 72, backgroundColor: colors.border }} /> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(item.href)}
                style={({ pressed }) => ({
                  opacity: pressed ? motion.opacity.pressed : 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceStrong,
                    }}>
                    <Icon name={item.icon} size={18} color={colors.text} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="subtitle">{item.title}</AppText>
                    <AppText variant="caption" tone="muted">
                      {item.body}
                    </AppText>
                  </View>
                  <Icon name="chevronRight" size={16} color={colors.textMuted} />
                </View>
              </Pressable>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
