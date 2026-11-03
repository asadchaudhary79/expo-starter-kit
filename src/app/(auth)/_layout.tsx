import { Stack } from 'expo-router/stack';

import { useAppTheme } from '@/theme/theme-provider';

export default function AuthLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      initialRouteName="splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
