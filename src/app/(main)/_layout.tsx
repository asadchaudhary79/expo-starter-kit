import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';

import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { useAuth } from '@/features/auth/auth-provider';
import { useAppTheme } from '@/theme/theme-provider';

export default function MainLayout() {
  const { phase } = useAuth();
  const { colors } = useAppTheme();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  const backButton = () => (
    <HeaderIconButton accessibilityLabel="Go back" icon="arrowLeft" onPress={goBack} />
  );

  return (
    <Stack
      initialRouteName={phase === 'needs-onboarding' ? '(onboarding)' : '(tabs)'}
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: 'minimal',
        headerBackTitle: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Protected guard={phase === 'needs-onboarding'}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={phase === 'ready'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit profile', headerLeft: backButton }} />
        <Stack.Screen name="delete-account" options={{ title: 'Delete account', headerLeft: backButton }} />
        <Stack.Screen name="biometric-lock" options={{ title: 'App lock', headerLeft: backButton }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications', headerLeft: backButton }} />
        <Stack.Screen name="notification/[id]" options={{ title: 'Notification', headerLeft: backButton }} />
      </Stack.Protected>
    </Stack>
  );
}
