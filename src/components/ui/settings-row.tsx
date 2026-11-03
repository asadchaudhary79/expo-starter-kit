import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type SettingsRowProps = {
  title: string;
  body?: string;
  icon: IconName;
  iconBackground?: string;
  iconColor?: string;
  value?: string;
  destructive?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
};

export function SettingsRow({
  title,
  body,
  icon,
  iconBackground,
  iconColor,
  value,
  destructive = false,
  disabled = false,
  showChevron,
  onPress,
}: SettingsRowProps) {
  const { colors, motion, radius, spacing } = useAppTheme();
  const titleColor = destructive ? colors.danger : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? motion.opacity.pressed : 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: pressed ? colors.surfaceStrong : 'transparent',
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            backgroundColor: iconBackground ?? colors.primary,
          }}>
          <Icon name={icon} size={16} color={iconColor ?? colors.primaryForeground} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="subtitle" style={{ color: titleColor, fontSize: 16 }}>
            {title}
          </AppText>
          {body ? (
            <AppText variant="caption" tone="muted">
              {body}
            </AppText>
          ) : null}
        </View>
        {value ? (
          <AppText variant="caption" tone="muted">
            {value}
          </AppText>
        ) : null}
        {(showChevron ?? Boolean(onPress && !destructive)) ? (
          <Icon name="chevronRight" size={16} color={colors.textMuted} />
        ) : null}
      </View>
    </Pressable>
  );
}
