import { router } from 'expo-router';
import { Image, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/theme/theme-provider';

export default function SplashScreen() {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Screen
      scroll={false}
      contentStyle={{
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: spacing.xxl,
        maxWidth: 420,
        width: '100%',
        alignSelf: 'center',
      }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
        <View
          style={{
            width: 96,
            height: 96,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.xl,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Image
            source={require('../../../../assets/images/splash-icon.png')}
            style={{ width: 56, height: 56 }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="hero" style={{ textAlign: 'center' }}>
            Expo Auth Starter
          </AppText>
          <AppText tone="muted" style={{ textAlign: 'center' }}>
            Sign in, protect screens, and ship faster.
          </AppText>
        </View>
      </View>

      <Button label="Get started" onPress={() => router.push('/sign-in')} />
    </Screen>
  );
}
