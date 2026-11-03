import { View, type ViewProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/theme/theme-provider';

type SettingsGroupProps = ViewProps & {
  title?: string;
  footer?: string;
};

export function SettingsGroup({ title, footer, children, style, ...props }: SettingsGroupProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View style={[{ gap: spacing.sm }, style]} {...props}>
      {title ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginLeft: spacing.md, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {title}
        </AppText>
      ) : null}
      <View
        style={{
          overflow: 'hidden',
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
        {children}
      </View>
      {footer ? (
        <AppText variant="caption" tone="muted" style={{ marginHorizontal: spacing.md, lineHeight: 16 }}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

export function SettingsDivider() {
  const { colors, spacing } = useAppTheme();

  return <View style={{ height: 1, marginLeft: 60, backgroundColor: colors.border }} />;
}
