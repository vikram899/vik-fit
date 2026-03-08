import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors, typography, spacing } = useTheme();

  const backgroundMap: Record<BadgeVariant, string> = {
    default: colors.focused,
    success: `${colors.success}22`,
    warning: `${colors.warning}22`,
    error: `${colors.error}22`,
    accent: `${colors.accent}22`,
  };

  const textColorMap: Record<BadgeVariant, string> = {
    default: colors.textSecondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    accent: colors.accent,
  };

  return (
    <View
      style={[
        {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: Radius.full,
          backgroundColor: backgroundMap[variant],
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ ...typography.caption, color: textColorMap[variant] }}>{label}</Text>
    </View>
  );
}
