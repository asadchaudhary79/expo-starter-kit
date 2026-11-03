import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/theme/theme-provider';

export function Card({ style, ...props }: ViewProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={[
        {
          gap: spacing.md,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          backgroundColor: colors.surface,
          boxShadow: '0 10px 30px rgba(28, 34, 51, 0.05)',
        },
        style,
      ]}
      {...props}
    />
  );
}
