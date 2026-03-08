import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@theme/index';
import { Card } from '@shared/components/ui/Card';
import { MacroSummary } from '@shared/types/common';
import { formatCalories, formatMacro } from '@shared/utils/formatUtils';

interface MacroSummaryBarProps {
  macros: MacroSummary;
}

export default function MacroSummaryBar({ macros }: MacroSummaryBarProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.base }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ ...typography.statMedium, color: colors.brandPrimary }}>
          {Math.round(macros.calories)}
        </Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>kcal</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ ...typography.statMedium, color: colors.textPrimary }}>
          {formatMacro(macros.protein)}
        </Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>Protein</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ ...typography.statMedium, color: colors.textPrimary }}>
          {formatMacro(macros.carbs)}
        </Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>Carbs</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ ...typography.statMedium, color: colors.textPrimary }}>
          {formatMacro(macros.fat)}
        </Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>Fat</Text>
      </View>
    </Card>
  );
}
