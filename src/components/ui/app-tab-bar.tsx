import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type AppTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const tabs: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'search', label: 'Search', icon: 'search' },
  { name: 'calendar', label: 'Calendar', icon: 'calendar' },
  { name: 'activity', label: 'Activity', icon: 'bell' },
  { name: 'profile', label: 'Profile', icon: 'person' },
];

export function AppTabBar({ state, navigation }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, fonts } = useAppTheme();
  const bottomPad =
    Platform.OS === 'web'
      ? Math.max(Math.min(insets.bottom || 0, 10), 6)
      : Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: bottomPad,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0px -4px 10px rgba(15, 23, 42, 0.06)' }
            : { shadowColor: '#0F172A' }),
        },
      ]}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
          const focused = routeIndex === state.index;

          return (
            <Pressable
              key={tab.name}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                const route = state.routes[routeIndex];
                if (!route) return;

                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={styles.item}>
              <View
                style={[
                  styles.iconWrap,
                  focused && { backgroundColor: colors.primarySoft },
                ]}>
                <Icon name={tab.icon} size={22} color={focused ? colors.primary : colors.textMuted} />
              </View>
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{
                  fontFamily: focused ? fonts.semibold : fonts.medium,
                  fontSize: 11,
                  letterSpacing: 0.15,
                  color: focused ? colors.primary : colors.textMuted,
                }}>
                {tab.label}
              </AppText>
              <View
                style={[
                  styles.dot,
                  focused && { backgroundColor: colors.primary },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      web: { boxShadow: '0px -4px 10px rgba(0,0,0,0.06)' },
      ios: {
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingHorizontal: 4,
    minHeight: 56,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    backgroundColor: 'transparent',
  },
});
