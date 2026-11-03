import { router } from 'expo-router';
import { Alert, Platform, Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { SettingsDivider, SettingsGroup } from '@/components/ui/settings-group';
import { SettingsRow } from '@/components/ui/settings-row';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { useAppTheme } from '@/theme/theme-provider';

export default function SettingsScreen() {
  const { isSigningOut, signOut, user } = useAuth();
  const { colors, motion, radius, spacing } = useAppTheme();

  function confirmSignOut() {
    // Alert.alert is a no-op on web, so confirm never reaches signOut there.
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm('Sign out?\n\nYou can sign back in at any time.');
      if (confirmed) void signOut();
      return;
    }

    Alert.alert('Sign out?', 'You can sign back in at any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <Screen
      hasHeader
      contentStyle={{
        gap: spacing.lg,
        paddingHorizontal: spacing.lg,
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        onPress={() => router.push('/edit-profile')}
        style={({ pressed }) => ({
          opacity: pressed ? motion.opacity.pressed : 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.lg,
          padding: spacing.lg,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        })}>
        <View
          style={{
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            backgroundColor: colors.primarySoft,
          }}>
          <AppText variant="title" tone="primary">
            {initials(user?.name)}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="subtitle" style={{ fontSize: 20 }}>
            {user?.name ?? 'Your account'}
          </AppText>
          <AppText tone="muted">{user?.email}</AppText>
          {user?.username ? (
            <AppText variant="caption" tone="primary">
              @{user.username}
            </AppText>
          ) : null}
        </View>
        <Icon name="chevronRight" size={18} color={colors.textMuted} />
      </Pressable>

      <SettingsGroup title="Security" footer="App lock stays on this device only.">
        <SettingsRow
          icon="lock"
          iconBackground="#111111"
          title="App Lock"
          body="Face ID, Touch ID, or biometrics"
          onPress={() => router.push('/biometric-lock')}
        />
        <SettingsDivider />
        <SettingsRow
          icon="mail"
          iconBackground="#3A3A3C"
          title="Email"
          value={user?.email ?? '—'}
        />
      </SettingsGroup>

      <SettingsGroup title="Preferences">
        <SettingsRow
          icon="bell"
          iconBackground="#1C1C1E"
          title="Notifications"
          body="Local schedules and Expo push"
          onPress={() => router.push('/notifications')}
        />
        <SettingsDivider />
        <SettingsRow
          icon="search"
          iconBackground="#48484A"
          title="Search"
          body="Find starter pages and features"
          onPress={() => router.push('/search')}
        />
        <SettingsDivider />
        <SettingsRow
          icon="info"
          iconBackground="#3A3A3C"
          title="Public tip"
          body="Works without signing in"
          onPress={() => router.push('/public')}
        />
      </SettingsGroup>

      <SettingsGroup title="Account">
        <SettingsRow
          icon="signOut"
          iconBackground="#636366"
          title={isSigningOut ? 'Signing out…' : 'Sign Out'}
          body="Leave this device"
          disabled={isSigningOut}
          showChevron={false}
          onPress={confirmSignOut}
        />
        <SettingsDivider />
        <SettingsRow
          icon="trash"
          iconBackground={colors.danger}
          title="Delete Account"
          body="Permanently remove this account"
          destructive
          onPress={() => router.push('/delete-account')}
        />
      </SettingsGroup>

    </Screen>
  );
}

function initials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return 'U';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
