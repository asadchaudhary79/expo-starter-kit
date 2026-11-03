import { Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/theme-provider';

type AppTextProps = TextProps & {
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'eyebrow';
  tone?: 'default' | 'muted' | 'primary' | 'danger';
};

export function AppText({ variant = 'body', tone = 'default', style, selectable = true, ...props }: AppTextProps) {
  const { colors, fonts, typography } = useAppTheme();
  const variantStyles = {
    hero: { fontFamily: fonts.bold, fontSize: typography.hero, lineHeight: 44 },
    title: { fontFamily: fonts.bold, fontSize: typography.title, lineHeight: 36 },
    subtitle: { fontFamily: fonts.bold, fontSize: typography.subtitle, lineHeight: 24 },
    body: { fontFamily: fonts.body, fontSize: typography.body, lineHeight: 24 },
    caption: { fontFamily: fonts.semibold, fontSize: typography.caption, lineHeight: 18 },
    eyebrow: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 1.1, textTransform: 'uppercase' },
  } as const;
  const toneColors = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    danger: colors.danger,
  } as const;

  return (
    <Text
      selectable={selectable}
      style={[
        variantStyles[variant],
        { color: toneColors[tone] },
        variant === 'eyebrow' ? { color: colors.primary } : { letterSpacing: 0 },
        style,
      ]}
      {...props}
    />
  );
}
