import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, style, padding }: CardProps) {
  const { colors, shadows } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Radius.lg,
    padding: padding ?? Layout.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  };

  return <View style={[cardStyle, style]}>{children}</View>;
}
