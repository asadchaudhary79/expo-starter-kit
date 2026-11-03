import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { useAuth } from '@/features/auth/auth-provider';
import { useAppTheme } from '@/theme/theme-provider';

const categories = [
  { href: '/search' as const, icon: 'search' as const, label: 'Search', tone: 'aqua' as const },
  { href: '/calendar' as const, icon: 'calendar' as const, label: 'Calendar', tone: 'peach' as const },
  { href: '/activity' as const, icon: 'bell' as const, label: 'Activity', tone: 'lavender' as const },
  { href: '/profile' as const, icon: 'person' as const, label: 'Profile', tone: 'mint' as const },
];

const starterCards = [
  {
    href: '/notifications' as const,
    icon: 'bell' as const,
    title: 'Notifications',
    body: 'Local schedules, Expo push, and backend send',
    meta: 'Push',
  },
  {
    href: '/calendar' as const,
    icon: 'calendar' as const,
    title: 'Calendar',
    body: 'Month grid with sample day events',
    meta: 'Common UI',
  },
  {
    href: '/edit-profile' as const,
    icon: 'person' as const,
    title: 'Edit profile',
    body: 'Name, username, and photo picker',
    meta: 'Account',
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors, motion, radius, spacing } = useAppTheme();
  const [query, setQuery] = useState('');
  const name = firstName(user?.name);
  const filteredCards = starterCards.filter((card) => {
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return card.title.toLowerCase().includes(needle) || card.body.toLowerCase().includes(needle);
  });

  return (
    <Screen contentStyle={{ gap: spacing.xl, paddingTop: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={() => router.push('/profile')}
            style={{
              width: 46,
              height: 46,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.pill,
              backgroundColor: colors.primarySoft,
            }}>
            <AppText variant="subtitle" tone="primary">
              {initials(user?.name)}
            </AppText>
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="caption" tone="muted">
              {greetingForHour(new Date().getHours())}
            </AppText>
            <AppText variant="subtitle">{name}</AppText>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <Icon name="checkCircle" size={14} color={colors.success} />
            <AppText variant="caption">Online</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open activity"
            onPress={() => router.push('/activity')}
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <Icon name="bell" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="hero">Auth starter made simple</AppText>
        <AppText tone="muted">Home, Search, Calendar, Activity, and Profile — tabs most apps already use.</AppText>
      </View>

      <SearchField
        placeholder="Search starter screens"
        value={query}
        onChangeText={setQuery}
        onFilterPress={() => router.push('/search')}
        returnKeyType="search"
        onSubmitEditing={() => router.push('/search')}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        onPress={() => router.push('/edit-profile')}
        style={({ pressed }) => ({ opacity: pressed ? motion.opacity.pressed : 1 })}>
        <Card style={{ backgroundColor: colors.primary, borderColor: colors.primary, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.pill,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                }}>
                <Icon name="person" size={24} color={colors.primaryForeground} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="subtitle" style={{ color: colors.primaryForeground }}>
                  {user?.name ?? 'Signed-in user'}
                </AppText>
                <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  {user?.username ? `@${user.username}` : user?.email}
                </AppText>
              </View>
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.pill,
                backgroundColor: colors.surface,
              }}>
              <Icon name="settings" size={18} color={colors.primary} />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              backgroundColor: 'rgba(255,255,255,0.14)',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="mail" size={16} color={colors.primaryForeground} />
              <AppText variant="caption" style={{ color: colors.primaryForeground }}>
                Verified session
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="clock" size={16} color={colors.primaryForeground} />
              <AppText variant="caption" style={{ color: colors.primaryForeground }}>
                Ready now
              </AppText>
            </View>
          </View>
        </Card>
      </Pressable>

      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="subtitle">Quick access</AppText>
          <Pressable onPress={() => router.push('/search')}>
            <AppText variant="caption" tone="primary">
              See all
            </AppText>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {categories.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => ({
                  width: '22%',
                  alignItems: 'center',
                  gap: spacing.sm,
                  opacity: pressed ? motion.opacity.pressed : 1,
                })}>
                <View
                  style={{
                    width: 58,
                    height: 58,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.pill,
                    backgroundColor: colors[item.tone],
                  }}>
                  <Icon name={item.icon} size={22} color={colors.text} />
                </View>
                <AppText variant="caption" style={{ textAlign: 'center' }}>
                  {item.label}
                </AppText>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Continue building</AppText>
        {filteredCards.length === 0 ? (
          <Card>
            <AppText variant="subtitle">No matches</AppText>
            <AppText tone="muted">Try another search term.</AppText>
          </Card>
        ) : (
          <Card style={{ paddingVertical: spacing.sm, gap: 0 }}>
            {filteredCards.map((card, index) => (
              <View key={card.href}>
                {index > 0 ? <View style={{ height: 1, marginLeft: 72, backgroundColor: colors.border }} /> : null}
                <Link href={card.href} asChild>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => ({
                      opacity: pressed ? motion.opacity.pressed : 1,
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.sm,
                    })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: radius.md,
                          backgroundColor: colors.primarySoft,
                        }}>
                        <Icon name={card.icon} size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <AppText variant="subtitle">{card.title}</AppText>
                        <AppText variant="caption" tone="muted">
                          {card.body}
                        </AppText>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: spacing.sm }}>
                        <View
                          style={{
                            borderRadius: radius.pill,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: 4,
                            backgroundColor: colors.surfaceStrong,
                          }}>
                          <AppText variant="caption" tone="primary">
                            {card.meta}
                          </AppText>
                        </View>
                        <Icon name="chevronRight" size={16} color={colors.textMuted} />
                      </View>
                    </View>
                  </Pressable>
                </Link>
              </View>
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || 'there';
}

function initials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return 'U';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
