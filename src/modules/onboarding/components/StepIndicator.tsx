import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Spacing } from '@theme/spacing';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number; // 0-indexed
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 4,
            flex: i === currentStep ? 2 : 1,
            borderRadius: Radius.full,
            backgroundColor: i <= currentStep ? colors.brandPrimary : colors.border,
          }}
        />
      ))}
    </View>
  );
}
