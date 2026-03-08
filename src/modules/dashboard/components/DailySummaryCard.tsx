import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@theme/index';
import { Card } from '@shared/components/ui/Card';
import { ProgressBar } from '@shared/components/ui/ProgressBar';
import { formatCalories } from '@shared/utils/formatUtils';
import { MacroSummary } from '@shared/types/common';

interface DailySummaryCardProps {
  eaten: MacroSummary;
  target: { targetCalories: number };
}

export default function DailySummaryCard({ eaten, target }: DailySummaryCardProps) {
  const { colors, typography, spacing } = useTheme();
  const progress = target.targetCalories > 0 ? eaten.calories / target.targetCalories : 0;
  const remaining = Math.max(target.targetCalories - eaten.calories, 0);

  return (
    <Card>
      <Text style={{ ...typography.sectionTitle, color: colors.textPrimary, marginBottom: spacing.xs }}>
        Calories Today
      </Text>
      <Text style={{ ...typography.statLarge, color: colors.brandPrimary, marginBottom: spacing.sm }}>
        {formatCalories(eaten.calories)}
      </Text>
      <ProgressBar progress={progress} style={{ marginBottom: spacing.sm }} />
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>
        {formatCalories(remaining)} remaining of {formatCalories(target.targetCalories)}
      </Text>
    </Card>
  );
}
