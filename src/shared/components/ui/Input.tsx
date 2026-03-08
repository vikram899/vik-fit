import React, { useState } from 'react';
import { TextInput, View, Text, ViewStyle, TextInputProps } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Spacing } from '@theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, ...props }: InputProps) {
  const { colors, typography, spacing } = useTheme();
  const [focused, setFocused] = useState(false);

  const inputStyle = {
    backgroundColor: colors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: error ? colors.error : focused ? colors.brandSecondary : colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    minHeight: 48,
    ...typography.body,
    color: colors.textPrimary,
  };

  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={{
            ...typography.label,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        {...props}
        style={[inputStyle, props.style]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
      />
      {error ? (
        <Text
          style={{
            ...typography.caption,
            color: colors.error,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
