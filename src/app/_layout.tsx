import '@/lib/web/ignore-abort-error';
import * as SplashScreen from 'expo-splash-screen';
import { Redirect, usePathname } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppToaster } from '@/components/ui/app-toaster';
import { Button } from '@/components/ui/button';
import { HeroPanel } from '@/components/ui/hero-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { BiometricGate } from '@/features/biometrics/components/biometric-gate';
import { useBiometricLock } from '@/features/biometrics/biometric-lock-provider';
import { PushSessionBridge } from '@/features/notifications/push-session-bridge';
import { AppProviders } from '@/providers/app-providers';
import { useAppTheme } from '@/theme/theme-provider';

if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync().catch(() => {
    // Fast Refresh can preserve an already-managed native splash screen.
  });
}

const signedOutPaths = [
  '/splash',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/public',
];
const signedInExitPaths = [
  '/splash',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/complete-profile',
  '/dashboard',
];

function SessionRedirect() {
  const { phase } = useAuth();
  const pathname = usePathname();

  if (phase === 'checking') return null;

  if (phase === 'signed-out' && !signedOutPaths.includes(pathname)) {
    return <Redirect href="/splash" />;
  }

  if (phase === 'needs-onboarding' && pathname !== '/complete-profile') {
    return <Redirect href="/complete-profile" />;
  }

  if (phase === 'ready' && signedInExitPaths.includes(pathname)) {
    return <Redirect href="/" />;
  }

  return null;
}

function RootNavigator() {
  const { isInitialSessionUnavailable, isRefreshingSession, phase, refreshSession } = useAuth();
  const { isReady: isBiometricReady } = useBiometricLock();
  const { colors, isReady: isThemeReady } = useAppTheme();
  const isStarting =
    (phase === 'checking' && !isInitialSessionUnavailable) || !isBiometricReady || !isThemeReady;
  const initialRouteName = phase === 'signed-out' ? '(auth)' : '(main)';

  useEffect(() => {
    if (Platform.OS !== 'web' && !isStarting) {
      void SplashScreen.hideAsync();
    }
  }, [isStarting]);

  if (isStarting) {
    return null;
  }

  if (isInitialSessionUnavailable) {
    return (
      <>
        <StatusBar style="dark" />
        <Screen
          scroll={false}
          contentStyle={{
            justifyContent: 'center',
            width: '100%',
            maxWidth: 420,
            alignSelf: 'center',
          }}>
          <HeroPanel
            eyebrow="Connection needed"
            title="We couldn’t reach your account"
            titleVariant="title"
            body="The sign-in service didn’t respond. Try again in a moment. A saved sign-in on this device stays put."
          />
          <Button
            label="Try again"
            loading={isRefreshingSession}
            onPress={() => void refreshSession()}
          />
        </Screen>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <SessionRedirect />
      <Stack
        initialRouteName={initialRouteName}
        screenOptions={{
          animation: 'none',
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(public)" />

        <Stack.Protected guard={phase === 'signed-out'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={phase === 'needs-onboarding' || phase === 'ready'}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
      </Stack>
      <PushSessionBridge />
      <BiometricGate />
    </>
  );
}

function ThemedAppRoot() {
  const { colors } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <RootNavigator />
      <AppToaster />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemedAppRoot />
    </AppProviders>
  );
}
