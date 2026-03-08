import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@theme/index';
import { Layout } from '@theme/spacing';
import { Radius } from '@theme/radius';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors, typography, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    paddingVertical: Layout.buttonPaddingVertical,
    paddingHorizontal: spacing['2xl'],
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTapHeight,
    opacity: disabled ? 0.5 : 1,
    ...(variant === 'primary'
      ? { backgroundColor: colors.brandPrimary }
      : {
          backgroundColor: colors.transparent,
          borderWidth: 1.5,
          borderColor: colors.border,
        }),
  };

  const textStyle: TextStyle = {
    ...typography.buttonText,
    color: variant === 'primary' ? colors.white : colors.brandPrimary,
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.brandPrimary} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
