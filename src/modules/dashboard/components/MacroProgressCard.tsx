import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@theme/index';
import { Card } from '@shared/components/ui/Card';
import { ProgressBar } from '@shared/components/ui/ProgressBar';
import { formatMacro } from '@shared/utils/formatUtils';

interface MacroItemProps {
  label: string;
  eaten: number;
  target: number;
  color: string;
}

function MacroItem({ label, eaten, target, color }: MacroItemProps) {
  const { colors, typography, spacing } = useTheme();
  const progress = target > 0 ? eaten / target : 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>{label}</Text>
        <Text style={{ ...typography.caption, color: colors.textPrimary }}>
          {formatMacro(eaten)} / {formatMacro(target)}
        </Text>
      </View>
      <ProgressBar progress={progress} color={color} height={4} />
    </View>
  );
}

interface MacroProgressCardProps {
  eaten: { protein: number; carbs: number; fat: number };
  target: { targetProtein: number; targetCarbs: number; targetFat: number };
}

export default function MacroProgressCard({ eaten, target }: MacroProgressCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <Card>
      <View style={{ gap: spacing.base }}>
        <MacroItem label="Protein" eaten={eaten.protein} target={target.targetProtein} color={colors.brandPrimary} />
        <MacroItem label="Carbs" eaten={eaten.carbs} target={target.targetCarbs} color={colors.accent} />
        <MacroItem label="Fat" eaten={eaten.fat} target={target.targetFat} color={colors.brandSecondary} />
      </View>
    </Card>
  );
}
