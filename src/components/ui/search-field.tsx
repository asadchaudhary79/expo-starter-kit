import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type SearchFieldProps = TextInputProps & {
  onFilterPress?: () => void;
};

export function SearchField({ onFilterPress, style, ...props }: SearchFieldProps) {
  const { colors, fonts, radius, spacing } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View
        style={{
          flex: 1,
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            {
              flex: 1,
              minHeight: 50,
              color: colors.text,
              fontFamily: fonts.body,
              fontSize: 15,
            },
            style,
          ]}
          {...props}
        />
      </View>
      {onFilterPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filters"
          onPress={onFilterPress}
          style={{
            width: 52,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Icon name="filter" size={18} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}
